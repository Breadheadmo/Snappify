import React from 'react';
import { CircularGallery, type GalleryItem } from './circular-gallery';

const galleryData: GalleryItem[] = [
  {
    common: 'Lion',
    binomial: 'Panthera leo',
    photo: {
      url: 'https://images.unsplash.com/photo-1583499871880-de841d1ace2a?w=900&auto=format&fit=crop&q=80',
      text: 'lion couple kissing on a brown rock',
      pos: '47% 35%',
      by: 'Clément Roy',
    },
  },
  {
    common: 'Asiatic elephant',
    binomial: 'Elephas maximus',
    photo: {
      url: 'https://images.unsplash.com/photo-1571406761758-9a3eed5338ef?w=900&auto=format&fit=crop&q=80',
      text: 'herd of Sri Lankan elephants walking',
      pos: '75% 65%',
      by: 'Alex Azabache',
    },
  },
  {
    common: 'Red-tailed black cockatoo',
    binomial: 'Calyptorhynchus banksii',
    photo: {
      url: 'https://images.unsplash.com/photo-1619664208054-41eefeab29e9?w=900&auto=format&fit=crop&q=80',
      text: 'close-up of a black cockatoo',
      pos: '53% 43%',
      by: 'David Clode',
    },
  },
  {
    common: 'Dromedary',
    binomial: 'Camelus dromedarius',
    photo: {
      url: 'https://images.unsplash.com/photo-1662841238473-f4b137e123cb?w=900&auto=format&fit=crop&q=80',
      text: 'camel and calf in Sahara',
      pos: '65% 65%',
      by: 'Moaz Tobok',
    },
  },
  {
    common: 'Polar bear',
    binomial: 'Ursus maritimus',
    photo: {
      url: 'https://images.unsplash.com/photo-1589648751789-c8ecb7a88bd5?w=900&auto=format&fit=crop&q=80',
      text: 'polar bear on snow by water',
      pos: '50% 25%',
      by: 'Hans-Jurgen Mager',
    },
  },
  {
    common: 'Giant panda',
    binomial: 'Ailuropoda melanoleuca',
    photo: {
      url: 'https://images.unsplash.com/photo-1659540181281-1d89d6112832?w=900&auto=format&fit=crop&q=80',
      text: 'giant panda on tree branch',
      pos: '47% 50%',
      by: 'Jiachen Lin',
    },
  },
  {
    common: "Grévy's zebra",
    binomial: 'Equus grevyi',
    photo: {
      url: 'https://images.unsplash.com/photo-1526095179574-86e545346ae6?w=900&auto=format&fit=crop&q=80',
      text: 'zebra standing on field',
      pos: '65% 35%',
      by: 'Jeff Griffith',
    },
  },
  {
    common: 'Cheetah',
    binomial: 'Acinonyx jubatus',
    photo: {
      url: 'https://images.unsplash.com/photo-1541707519942-08fd2f6480ba?w=900&auto=format&fit=crop&q=80',
      text: 'cheetah sitting in grass',
      by: 'Mike Bird',
    },
  },
  {
    common: 'King penguin',
    binomial: 'Aptenodytes patagonicus',
    photo: {
      url: 'https://images.unsplash.com/photo-1595792419466-23cec2476fa6?w=900&auto=format&fit=crop&q=80',
      text: 'penguin with chick',
      pos: '35% 50%',
      by: 'Martin Wettstein',
    },
  },
  {
    common: 'Red panda',
    binomial: 'Ailurus fulgens',
    photo: {
      url: 'https://images.unsplash.com/photo-1689799513565-44d2bc09d75b?w=900&auto=format&fit=crop&q=80',
      text: 'red panda in a tree',
      by: 'Niels Baars',
    },
  },
];

const CircularGalleryDemo = () => {
  return (
    <div className="w-full bg-white text-gray-900" style={{ height: '500vh' }}>
      <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center mb-8 absolute top-16 z-10">
          <h1 className="text-4xl font-bold">Trending Gallery</h1>
          <p className="text-gray-500">Scroll to rotate the gallery</p>
        </div>
        <div className="w-full h-full">
          <CircularGallery items={galleryData} />
        </div>
      </div>
    </div>
  );
};

export default CircularGalleryDemo;

