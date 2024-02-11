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
    gm: Player;
    players: Player[];
    spots: number;
};
