import { describe, expect, it } from 'vitest';
import { checkUrl } from './urlSafety';

/**
 * Link kısaltma, kimlik doğrulaması olmadan yazma yapılabilen tek uç nokta.
 * Buradaki her test bir kötüye kullanım senaryosunu kapatıyor; gevşetilmemeli.
 */

describe('checkUrl — kabul edilenler', () => {
  it('http ve https adreslerini kabul eder', () => {
    expect(checkUrl('https://example.com/a').ok).toBe(true);
    expect(checkUrl('http://example.com').ok).toBe(true);
  });

  it('baştaki ve sondaki boşlukları temizler', () => {
    const result = checkUrl('  https://example.com/x  ');
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.url).toBe('https://example.com/x');
  });

  it('sorgu ve fragment korunur', () => {
    const result = checkUrl('https://example.com/a?b=1#c');
    expect(result.ok && result.url).toBe('https://example.com/a?b=1#c');
  });
});

describe('checkUrl — şema kısıtı', () => {
  it('javascript: şemasını reddeder', () => {
    // Yönlendirmede XSS'e dönüşebilir.
    expect(checkUrl('javascript:alert(1)').ok).toBe(false);
  });

  it('data: şemasını reddeder', () => {
    expect(checkUrl('data:text/html,<script>alert(1)</script>').ok).toBe(false);
  });

  it('file: ve ftp: şemalarını reddeder', () => {
    expect(checkUrl('file:///etc/passwd').ok).toBe(false);
    expect(checkUrl('ftp://example.com').ok).toBe(false);
  });
});

describe('checkUrl — iç ağ ve metadata', () => {
  it('loopback adreslerini reddeder', () => {
    expect(checkUrl('http://localhost:3000').ok).toBe(false);
    expect(checkUrl('http://127.0.0.1/admin').ok).toBe(false);
    expect(checkUrl('http://[::1]/').ok).toBe(false);
    expect(checkUrl('http://0.0.0.0/').ok).toBe(false);
  });

  it('bulut metadata uç noktalarını reddeder', () => {
    expect(checkUrl('http://169.254.169.254/latest/meta-data/').ok).toBe(false);
    expect(checkUrl('http://metadata.google.internal/').ok).toBe(false);
  });

  it('IPv6 loopback ve yerel adreslerini reddeder', () => {
    // Gerileme testi: URL.hostname IPv6'yı "[::1]" diye döndürüyor. Parantezler
    // soyulmadığı için bu adresler bir süre engeli atlıyordu.
    expect(checkUrl('http://[::1]/').ok).toBe(false);
    expect(checkUrl('http://[0:0:0:0:0:0:0:1]/').ok).toBe(false);
    expect(checkUrl('http://[::ffff:127.0.0.1]/').ok).toBe(false);
    expect(checkUrl('http://[fe80::1]/').ok).toBe(false);
    expect(checkUrl('http://[fd00::1]/').ok).toBe(false);
  });

  it('loopback bloğunun tamamını reddeder', () => {
    expect(checkUrl('http://127.0.0.2/').ok).toBe(false);
    expect(checkUrl('http://127.255.255.254/').ok).toBe(false);
  });

  it('sayısal ve onaltılık IPv4 yazımıyla kaçılamaz', () => {
    // WHATWG URL bunları 127.0.0.1'e normalize eder; yine de kapalı kaldığını doğrulayalım.
    expect(checkUrl('http://2130706433/').ok).toBe(false);
    expect(checkUrl('http://0x7f.0.0.1/').ok).toBe(false);
  });

  it('link-local aralığının tamamını reddeder', () => {
    expect(checkUrl('http://169.254.1.1/').ok).toBe(false);
  });

  it('özel IP aralıklarını reddeder', () => {
    expect(checkUrl('http://10.0.0.5/').ok).toBe(false);
    expect(checkUrl('http://192.168.1.1/').ok).toBe(false);
    expect(checkUrl('http://172.16.0.1/').ok).toBe(false);
    expect(checkUrl('http://172.31.255.255/').ok).toBe(false);
  });

  it('172.16-31 dışındaki 172.x adresleri engellenmez', () => {
    // Sınır kontrolü: 172.15 ve 172.32 özel aralıkta değildir.
    expect(checkUrl('http://172.15.0.1/').ok).toBe(true);
    expect(checkUrl('http://172.32.0.1/').ok).toBe(true);
  });

  it('.local ve .internal alanlarını reddeder', () => {
    expect(checkUrl('http://yazici.local/').ok).toBe(false);
    expect(checkUrl('http://db.internal/').ok).toBe(false);
  });

  it('büyük harfli yazımla kaçılamaz', () => {
    expect(checkUrl('http://LOCALHOST/').ok).toBe(false);
    expect(checkUrl('http://Yazici.LOCAL/').ok).toBe(false);
  });
});

describe('checkUrl — zincirleme kısaltma', () => {
  it('bilinen kısaltma servislerini reddeder', () => {
    for (const host of ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly']) {
      expect(checkUrl(`https://${host}/abc`).ok, host).toBe(false);
    }
  });

  it('kendi alan adını reddeder', () => {
    expect(checkUrl('https://fwt.dev/s/abc', 'fwt.dev').ok).toBe(false);
  });

  it('selfHost karşılaştırması büyük/küçük harf duyarsızdır', () => {
    expect(checkUrl('https://FWT.dev/s/abc', 'fwt.dev').ok).toBe(false);
  });
});

describe('checkUrl — biçim', () => {
  it('boş girdiyi reddeder', () => {
    expect(checkUrl('   ').ok).toBe(false);
  });

  it('URL olmayan metni reddeder', () => {
    expect(checkUrl('bu bir url değil').ok).toBe(false);
  });

  it('2048 karakterden uzun adresi reddeder', () => {
    expect(checkUrl(`https://example.com/${'a'.repeat(2100)}`).ok).toBe(false);
  });

  it('her reddin bir gerekçesi vardır', () => {
    const result = checkUrl('javascript:alert(1)');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason.length).toBeGreaterThan(0);
  });
});
