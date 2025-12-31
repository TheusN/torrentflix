import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import { settingsService } from './settings.service.js';
import {
  JackettSearchResponse,
  SearchResult,
  SearchParams,
  transformSearchResult,
  JACKETT_CATEGORIES,
} from '../types/search.types.js';

class JackettService {
  private cachedConfig: { url: string; apiKey: string; enabled: boolean; password?: string } | null = null;

  // Obter configuração atualizada do banco/env
  private async getConfig(): Promise<{ url: string; apiKey: string; enabled: boolean; password?: string }> {
    const dbConfig = await settingsService.getJackettConfig();
    this.cachedConfig = dbConfig;
    return dbConfig;
  }

  // Clear cache
  clearCache(): void {
    this.cachedConfig = null;
  }

  private sessionCookie: string | null = null;

  // Autenticar com senha de UI do Jackett
  private async authenticate(baseUrl: string, password: string): Promise<string | null> {
    try {
      const response = await fetch(`${baseUrl}/UI/Dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `password=${encodeURIComponent(password)}`,
        redirect: 'manual',
      });

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        return setCookie.split(';')[0];
      }
      return null;
    } catch (error) {
      logger.error('Jackett authentication failed:', error);
      return null;
    }
  }

  // Check connection to Jackett
  async checkConnection(): Promise<boolean> {
    try {
      this.clearCache();
      const cfg = await this.getConfig();

      if (!cfg.url) {
        throw new Error('URL do Jackett nao configurada');
      }
      if (!cfg.apiKey) {
        throw new Error('API Key do Jackett nao configurada');
      }

      // Remover barra final da URL e /UI/Dashboard se presente
      let baseUrl = cfg.url.replace(/\/+$/, '');
      baseUrl = baseUrl.replace(/\/UI\/Dashboard$/i, '');

      // Adicionar timeout de 10 segundos
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        // Preparar headers
        const headers: Record<string, string> = {};

        // Se tiver senha de UI, autenticar primeiro
        if (cfg.password) {
          const cookie = await this.authenticate(baseUrl, cfg.password);
          if (cookie) {
            this.sessionCookie = cookie;
            headers['Cookie'] = cookie;
          }
        } else if (this.sessionCookie) {
          headers['Cookie'] = this.sessionCookie;
        }

        const response = await fetch(
          `${baseUrl}/api/v2.0/indexers?apikey=${cfg.apiKey}`,
          {
            method: 'GET',
            headers,
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        // Verificar se retornou "Cookies required" (senha de UI ativada)
        const text = await response.text();
        if (text.includes('Cookies required')) {
          throw new Error('Jackett exige senha de UI. Preencha o campo "Senha UI" nas configuracoes');
        }

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('API Key do Jackett invalida');
          }
          throw new Error(`Erro Jackett: ${response.status}`);
        }

        return true;
      } catch (error: any) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          throw new Error('Timeout: Jackett demorou muito para responder');
        }
        throw error;
      }
    } catch (error: any) {
      logger.error('Jackett connection check failed:', error?.message);
      throw error;
    }
  }

  // Get configured indexers
  async getIndexers(): Promise<{ id: string; name: string; configured: boolean }[]> {
    try {
      const cfg = await this.getConfig();
      let baseUrl = cfg.url.replace(/\/+$/, '');
      baseUrl = baseUrl.replace(/\/UI\/Dashboard$/i, '');

      // Preparar headers com cookie de autenticação
      const headers: Record<string, string> = {};
      if (cfg.password && !this.sessionCookie) {
        const cookie = await this.authenticate(baseUrl, cfg.password);
        if (cookie) {
          this.sessionCookie = cookie;
        }
      }
      if (this.sessionCookie) {
        headers['Cookie'] = this.sessionCookie;
      }

      const response = await fetch(
        `${baseUrl}/api/v2.0/indexers?apikey=${cfg.apiKey}`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        throw new Error(`Jackett API error: ${response.status}`);
      }

      const text = await response.text();
      if (text.includes('Cookies required')) {
        throw new Error('Jackett exige senha de UI');
      }

      const indexers = JSON.parse(text) as any[];

      return indexers.map((indexer: any) => ({
        id: indexer.id,
        name: indexer.name,
        configured: indexer.configured,
      }));
    } catch (error: any) {
      logger.error('Failed to get Jackett indexers:', error?.message);
      throw new Error('Failed to get indexers from Jackett');
    }
  }

  // Search for torrents
  async search(params: SearchParams): Promise<{
    results: SearchResult[];
    indexersSearched: number;
    totalResults: number;
  }> {
    try {
      const cfg = await this.getConfig();
      const queryParams = new URLSearchParams();
      queryParams.append('apikey', cfg.apiKey);
      queryParams.append('Query', params.query);

      // Add categories if specified
      if (params.categories && params.categories.length > 0) {
        queryParams.append('Category[]', params.categories.join(','));
      }

      // Determine endpoint based on indexers
      let endpoint = '/api/v2.0/indexers/all/results';
      if (params.indexers && params.indexers.length === 1) {
        endpoint = `/api/v2.0/indexers/${params.indexers[0]}/results`;
      }

      logger.info(`Jackett search: ${params.query}`);

      const response = await fetch(
        `${cfg.url}${endpoint}?${queryParams.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Jackett API error: ${response.status}`);
      }

      const data = await response.json() as JackettSearchResponse;

      // Transform results
      let results = data.Results.map(transformSearchResult);

      // Filter by specific indexers if multiple specified
      if (params.indexers && params.indexers.length > 1) {
        results = results.filter(r => params.indexers!.includes(r.trackerId));
      }

      // Sort by seeders
      results.sort((a, b) => b.seeders - a.seeders);

      // Limit results
      if (params.limit && params.limit > 0) {
        results = results.slice(0, params.limit);
      }

      return {
        results,
        indexersSearched: data.Indexers.filter(i => i.status === 2).length,
        totalResults: data.Results.length,
      };
    } catch (error) {
      logger.error('Jackett search failed:', error);
      throw new Error('Search failed');
    }
  }

  // Search for movies
  async searchMovies(query: string, limit?: number): Promise<SearchResult[]> {
    const { results } = await this.search({
      query,
      categories: [JACKETT_CATEGORIES.Movies, JACKETT_CATEGORIES.MoviesHD, JACKETT_CATEGORIES.Movies4K],
      limit,
    });
    return results;
  }

  // Search for TV shows
  async searchTV(query: string, limit?: number): Promise<SearchResult[]> {
    const { results } = await this.search({
      query,
      categories: [JACKETT_CATEGORIES.TV, JACKETT_CATEGORIES.TVHD, JACKETT_CATEGORIES.TV4K],
      limit,
    });
    return results;
  }

  // Get download link (for indexers that don't provide magnet)
  async getDownloadLink(result: SearchResult): Promise<string | null> {
    // If magnet URI is available, use it
    if (result.magnetUri) {
      return result.magnetUri;
    }

    // If download link is available, return it
    if (result.downloadLink) {
      return result.downloadLink;
    }

    return null;
  }
}

export const jackettService = new JackettService();
export default jackettService;
