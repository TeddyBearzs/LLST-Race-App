export type House = 'Blue' | 'Red' | 'Yellow';

export interface Student {
  id: string;
  name: string;
  house: House;
  points: number;
}

export type RaceType = '100M' | 'Egg and Spoon' | 'Sack' | 'Wheel-Chair' | 'Relay';

export interface RaceResult {
  id: string;
  timestamp: string;
  raceType: RaceType;
  division: string;
  heat: number;
  lane: number;
  athleteName: string;
  house: House;
  time: string;
}

export interface HousePoints {
  Blue: number;
  Red: number;
  Yellow: number;
}
