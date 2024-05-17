export interface CreatorTmdbI {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string;
}

export interface GenreTmdbI {
    id: number;
    name: string;
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
}

export interface NetworkTmdbI {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
}

export interface ProductionCompanyTmdbI {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
}

export interface ProductionCountryTmdbI {
    iso_3166_1: string;
    name: string;
}

export interface SeasonTmdbI {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
}

export interface SpokenLanguageTmdbI {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface SerijaDetaljnoTmdbI {
    adult: boolean;
    backdrop_path: string;
    created_by: Array<CreatorTmdbI>;
    episode_run_time: Array<number>;
    first_air_date: string;
    genres: Array<GenreTmdbI>;
    homepage: string;
    id: number;
    in_production: boolean;
    languages: Array<string>;
    last_air_date: string;
    last_episode_to_air: Episode;
    name: string;
    next_episode_to_air: Episode;
    networks: Array<NetworkTmdbI>;
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: Array<string>;
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: Array<ProductionCompanyTmdbI>;
    production_countries: Array<ProductionCountryTmdbI>
    seasons: Array<SeasonTmdbI>;
    spoken_languages: Array<SpokenLanguageTmdbI>
    status: string;
    tagline: string;
    type: string;
    vote_average: number;
    vote_count: number;
}