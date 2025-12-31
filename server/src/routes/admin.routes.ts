import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AdminController } from '../controllers/admin.controller.js';

const router = Router();
const adminController = new AdminController();

// Todas as rotas de admin requerem autenticação e role admin
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/painel/stats', adminController.getDashboardStats);

// Gerenciamento de Usuários
router.get('/usuarios', adminController.listUsers);
router.post('/usuarios', adminController.createUser);
router.get('/usuarios/:id', adminController.getUser);
router.put('/usuarios/:id', adminController.updateUser);
router.delete('/usuarios/:id', adminController.deleteUser);

// Configurações do Sistema
router.get('/configuracoes', adminController.getSettings);
router.put('/configuracoes', adminController.updateSettings);
router.get('/configuracoes/testar/:service', adminController.testConnection);
router.get('/configuracoes/mapeamentos', adminController.getRemotePathMappings);

// Logs de Atividade
router.get('/logs', adminController.getLogs);

// Estatísticas
router.get('/estatisticas/sistema', adminController.getSystemStats);
router.get('/estatisticas/downloads', adminController.getDownloadStats);

export default router;
