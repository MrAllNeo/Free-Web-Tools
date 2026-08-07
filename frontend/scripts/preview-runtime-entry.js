/**
 * Önizleme iframe'inin React çalışma zamanı — esbuild bunu tek dosyaya paketler.
 *
 * React 19 artık UMD build'i yayınlamıyor, yani tarayıcıya doğrudan <script> ile
 * verilebilecek hazır bir dosya yok. CDN'den çekmek de istemiyoruz: Tailwind için
 * verdiğimiz kararın aynısı geçerli — çevrimdışı çalışmalı ve ziyaretçinin IP'si
 * üçüncü tarafa gitmemeli. Bu yüzden kendi paketimizi kendimiz üretiyoruz.
 *
 * Çıktı `public/preview/react-runtime.js`; iframe onu kendi kaynağımızdan yükler.
 */
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';

window.React = React;
window.ReactDOMClient = ReactDOMClient;
