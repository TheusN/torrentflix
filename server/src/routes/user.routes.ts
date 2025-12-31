import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { UserController } from '../controllers/user.controller.js';

const router = Router();
const userController = new UserController();

// Todas as rotas de usuário requerem autenticação
router.use(authenticate);

// Perfil
router.get('/perfil', userController.getProfile);
router.put('/perfil', userController.updateProfile);
router.put('/senha', userController.changePassword);

// Progresso de Visualização (Continuar Assistindo)
router.get('/progresso', userController.getProgress);
router.post('/progresso', userController.saveProgress);
router.delete('/progresso/:id', userController.deleteProgress);

// Minha Lista (Watchlist)
router.get('/lista', userController.getWatchlist);
router.post('/lista', userController.addToWatchlist);
router.delete('/lista/:id', userController.removeFromWatchlist);

// Histórico
router.get('/historico', userController.getHistory);
router.delete('/historico', userController.clearHistory);
router.delete('/historico/:id', userController.removeHistoryItem);

// Preferências
router.get('/preferencias', userController.getPreferences);
router.put('/preferencias', userController.updatePreferences);

export default router;
