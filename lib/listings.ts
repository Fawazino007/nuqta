export interface Listing {
  seller: string;
  photo: string;
  name: string;
  condition: string;
  weight: string;
  gripSize: string;
  price: string;
}

export const listings: Listing[] = [
  {
    seller: 'KHALED_93',
    photo: '/BABOLAT%20PURE%20DRIVE.png',
    name: 'BABOLAT PURE DRIVE',
    condition: 'LIKE NEW',
    weight: '300G',
    gripSize: 'G2',
    price: 'KD 45.000',
  },
  {
    seller: 'TENNIS_Q8',
    photo: '/WILSON%20PRO%20STAFF%2097.png',
    name: 'WILSON PRO STAFF 97',
    condition: 'GOOD',
    weight: '315G',
    gripSize: 'G3',
    price: 'KD 38.500',
  },
  {
    seller: 'PADEL_KWT',
    photo: '/HEAD%20DELTA%20HYBRID.png',
    name: 'HEAD DELTA HYBRID',
    condition: 'NEW',
    weight: '360G',
    gripSize: 'G1',
    price: 'KD 62.000',
  },
  {
    seller: 'SPORT_SHOP96',
    photo: '/YONEX%20EZONE%2098.png',
    name: 'YONEX EZONE 98',
    condition: 'FAIR',
    weight: '295G',
    gripSize: 'G2',
    price: 'KD 28.000',
  },
  {
    seller: 'ACE_PLAYER',
    photo: '/PRINCE%20TEXTREME%20TOUR.png',
    name: 'PRINCE TEXTREME TOUR',
    condition: 'LIKE NEW',
    weight: '305G',
    gripSize: 'G3',
    price: 'KD 52.500',
  },
];
