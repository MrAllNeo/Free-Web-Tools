import { Router } from 'express';
import { searchScene } from '../controllers/sceneController';
import { sceneSearchLimiter } from '../middleware/rateLimit';

export const sceneRouter = Router();

// Ekran görüntüsü base64 olarak taşınıyor; genel 1 MB gövde sınırı bunun için
// yetersiz. app.ts bu router'ın gövdesini genel ayrıştırıcının dışında tutup
// ayrı (daha büyük) bir sınırla ayrıştırır — bkz. app.ts'deki not.
export const SCENE_JSON_BODY_LIMIT = '20mb';

sceneRouter.post('/search', sceneSearchLimiter, searchScene);
