export interface MountainRange {
  name: string;
  lat: number;
  lng: number;
  peak: string;
  height: number;
  bearing: number;
  spread: number;
}

export const mountainRanges: MountainRange[] = [
  { name: 'Andes', lat: -21, lng: -68, peak: 'Aconcagua', height: 6961, bearing: 8, spread: 15 },
  { name: 'Rocky Mountains', lat: 45, lng: -111, peak: 'Mount Elbert', height: 4401, bearing: 18, spread: 13 },
  { name: 'Himalayas', lat: 28.3, lng: 86, peak: 'Mount Everest', height: 8849, bearing: 88, spread: 12 },
  { name: 'Karakoram', lat: 35.8, lng: 76.5, peak: 'K2', height: 8611, bearing: 70, spread: 6 },
  { name: 'Alps', lat: 46.4, lng: 10.1, peak: 'Mont Blanc', height: 4808, bearing: 82, spread: 5 },
  { name: 'Atlas Mountains', lat: 31.1, lng: -7.9, peak: 'Toubkal', height: 4167, bearing: 54, spread: 6 },
  { name: 'Caucasus', lat: 42.5, lng: 44.5, peak: 'Mount Elbrus', height: 5642, bearing: 93, spread: 5 },
  { name: 'Great Dividing Range', lat: -26.5, lng: 149, peak: 'Mount Kosciuszko', height: 2228, bearing: 15, spread: 12 },
  { name: 'Southern Alps', lat: -43.5, lng: 170.1, peak: 'Aoraki', height: 3724, bearing: 28, spread: 5 },
  { name: 'Drakensberg', lat: -29, lng: 29.2, peak: 'Thabana Ntlenyana', height: 3482, bearing: 18, spread: 5 },
  { name: 'Ural Mountains', lat: 58, lng: 59, peak: 'Mount Narodnaya', height: 1895, bearing: 8, spread: 14 },
  { name: 'Scandinavian Mountains', lat: 63, lng: 11, peak: 'Galdhøpiggen', height: 2469, bearing: 18, spread: 9 },
  { name: 'Zagros Mountains', lat: 32, lng: 49, peak: 'Qash-Mastan', height: 4409, bearing: 135, spread: 8 },
  { name: 'Tien Shan', lat: 42, lng: 79, peak: 'Jengish Chokusu', height: 7439, bearing: 95, spread: 8 },
  { name: 'Alaska Range', lat: 63, lng: -151, peak: 'Denali', height: 6190, bearing: 75, spread: 6 },
  { name: 'Sierra Madre', lat: 24, lng: -105, peak: 'Cerro Mohinora', height: 3300, bearing: 20, spread: 9 },
  { name: 'Transantarctic Mountains', lat: -83, lng: 165, peak: 'Mount Kirkpatrick', height: 4528, bearing: 55, spread: 15 },
];

export const mountainPoints = mountainRanges.flatMap((range) =>
  Array.from({ length: 7 }, (_, index) => {
    const offset = (index - 3) / 3;
    const radians = (range.bearing * Math.PI) / 180;
    const distance = offset * range.spread;
    return {
      ...range,
      lat: range.lat + Math.cos(radians) * distance * 0.45,
      lng: range.lng + Math.sin(radians) * distance,
      height: range.height * (0.48 + 0.52 * (1 - Math.abs(offset) * 0.62)),
      primary: index === 3,
    };
  }),
);
