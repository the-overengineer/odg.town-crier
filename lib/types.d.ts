export declare type Player = {
    name: string;
    url: string;
    discordName: string;
};

export declare type Game = {
    name: string;
    url: string;
    odg: string;
    odgLink: string;
    date: Date;
    gm: Player;
    players: Player[];
    spots: number;
};
