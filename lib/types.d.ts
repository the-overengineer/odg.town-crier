export declare type Player = {
    name: string;
    url: string;
    discordName: string;
};

export declare type Game = {
    name: string;
    url: string;
    odg: string;
    date: Date;
    gmName: string;
    players: Player[];
};
