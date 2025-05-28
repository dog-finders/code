// petService.js
// 임시로 간단히 데이터 반환하는 예시

const pets = [
  { id: 1, name: '멍멍이', type: '개' },
  { id: 2, name: '야옹이', type: '고양이' },
];

exports.getAllPets = () => {
  return pets;
};

exports.getPetById = (id) => {
  return pets.find(pet => pet.id === Number(id));
};
