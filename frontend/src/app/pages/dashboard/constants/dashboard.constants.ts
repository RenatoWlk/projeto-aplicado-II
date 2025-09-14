export class DashboardConstants {
  public static readonly GET_CAMPAIGNS_ENDPOINT = '/api/dashboard/campaigns';
  public static readonly GET_OFFERS_ENDPOINT = '/api/dashboard/offers';
  public static readonly CREATE_CAMPAIGN_ENDPOINT = '/api/dashboard/campaign/create';
  public static readonly CREATE_OFFER_ENDPOINT = '/api/dashboard/offer/create';

  public static readonly ERROR_GENERIC = 'Ocorreu um erro. Tente novamente.';
  public static readonly LOGIN_REQUIRED_MESSAGE = 'Você precisa estar logado para ver essas informações.';

  public static readonly POSTS_SECTION_TITLE = 'Publicações dos Bancos de Sangue';
  public static readonly OFFERS_SECTION_TITLE = 'Ofertas dos Parceiros';
  public static readonly NEARBY_BLOODBANKS_SECTION_TITLE = 'Bancos de sangue próximos à você';
  public static readonly STATS_SECTION_TITLE = 'Estatísticas de doação';
  public static readonly ACHIEVEMENTS_SECTION_TITLE = 'Conquistas';
}
