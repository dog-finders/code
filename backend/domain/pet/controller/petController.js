exports.getAllPets = (req, res) => {
  res.json([]); // 빈 배열 반환
};

exports.getPetById = (req, res) => {
  res.json({ id: req.params.id, name: '예시 펫' });
};
