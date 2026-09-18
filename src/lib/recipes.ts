// ============================================================
// AksesPangan — Database Resep Cerdas Olahan Bahan Baku Surplus
// Menghubungkan bahan mentah dengan ide masak bergizi & zero-waste
// ============================================================

import type { CulinaryRecipe } from '@/types';

export const CULINARY_RECIPES: CulinaryRecipe[] = [
  {
    id: 'recipe-kentang-sop',
    ingredientKeywords: ['kentang', 'wortel', 'sayur', 'bawang'],
    title: 'Sop Bening Sayur Gurih Bergizi',
    difficulty: 'Mudah',
    prepTime: '20 Menit',
    portion: '4 Porsi',
    description: 'Olahan segar yang memaksimalkan kesegaran kentang dan sayuran surplus dengan kaldu ayam/bawang bening hangat.',
    ingredients: [
      '300g Kentang Dieng (kupas & potong dadu)',
      '2 buah Wortel (potong bulat)',
      '4 siung Bawang Putih (geprek cincang)',
      '2 batang Daun Bawang & Seledri',
      '750ml Air bersih',
      'Garam, merica bubuk, dan kaldu jamur secukupnya',
    ],
    steps: [
      'Tumis bawang putih cincang dengan sedikit minyak hingga harum keemasan.',
      'Didihkan air di panci, lalu masukkan tumisan bawang putih.',
      'Masukkan potongan kentang terlebih dahulu hingga setengah empuk (±7 menit).',
      'Tambahkan wortel, seledri, garam, merica, dan kaldu jamur. Masak hingga matang.',
      'Taburi irisan daun bawang sesaat sebelum diangkat untuk aroma wangi segar.',
    ],
    nutritionNote: 'Kaya akan kalium, vitamin C, dan serat pangan yang baik untuk pencernaan.',
    zeroWasteTip: 'Kulit kentang yang sudah dicuci bersih bisa dipanggang dengan sedikit garam menjadi keripik renyah!',
  },
  {
    id: 'recipe-beras-merah-bubur',
    ingredientKeywords: ['beras', 'beras merah', 'cangkuang', 'organik'],
    title: 'Bubur Beras Merah Gurih Daun Kelor',
    difficulty: 'Mudah',
    prepTime: '30 Menit',
    portion: '3-4 Porsi',
    description: 'Sarapan padat nutrisi dari beras merah organik surplus, bertekstur lembut dengan aroma rempah alami.',
    ingredients: [
      '200g Beras Merah Organik (rendam air 1 jam)',
      '1 liter Air atau air kaldu sayur',
      '2 lembar Daun Salam & 1 batang Serai (memarkan)',
      '1 sdt Garam & 1/2 sdt ketumbar bubuk',
      'Pelengkap: suwiran tahu/telur rebus dan bawang goreng',
    ],
    steps: [
      'Rebus beras merah yang telah direndam bersama air, daun salam, dan serai.',
      'Aduk berkala di atas api sedang hingga butiran beras mekar lembut.',
      'Tambahkan garam dan ketumbar bubuk saat bubur mengental.',
      'Koreksi rasa, angkat dan sajikan hangat bersama taburan bawang goreng.',
    ],
    nutritionNote: 'Indeks glikemik rendah, tinggi antosianin dan serat kompleks penstabil gula darah.',
    zeroWasteTip: 'Air rendaman beras merah kaya akan nutrisi dan vitamin B, sangat bagus untuk menyiram tanaman rumah!',
  },
  {
    id: 'recipe-buah-salad',
    ingredientKeywords: ['semangka', 'melon', 'buah', 'pisang', 'jeruk'],
    title: 'Salad Buah Segar Dressing Yoghurt Madu',
    difficulty: 'Mudah',
    prepTime: '10 Menit',
    portion: '2-3 Porsi',
    description: 'Kombinasi buah-buahan surplus manis segar dengan saus yoghurt madu dingin yang menyegarkan dahaga.',
    ingredients: [
      '200g Semangka Merah (potong dadu)',
      '200g Melon Madu (potong dadu)',
      '2 buah Jeruk Manis (kupas juring)',
      '100g Yoghurt plain atau saus keju manis',
      '2 sdm Madu murni',
      'Sedikit perasan air jeruk nipis',
    ],
    steps: [
      'Campurkan potongan semangka, melon, dan jeruk dalam mangkuk saji.',
      'Dalam mangkuk kecil, aduk rata yoghurt, madu, dan sedikit air jeruk nipis.',
      'Tuangkan dressing di atas potongan buah segar, aduk perlahan.',
      'Simpan 10 menit di lemari es sebelum disajikan agar lebih nikmat.',
    ],
    nutritionNote: 'Sumber hidrasi alami yang kaya elektrolit, likopen, dan vitamin C pencegah radikal bebas.',
    zeroWasteTip: 'Kulit putih semangka (albedo) dapat ditumis dengan cabai dan bawang menjadi hidangan sayur gurih!',
  },
  {
    id: 'recipe-sayur-lodeh',
    ingredientKeywords: ['sayur segar', 'labu', 'kacang panjang', 'sayuran', 'jagung'],
    title: 'Sayur Lodeh Rumahan Gurih Santan Encer',
    difficulty: 'Sedang',
    prepTime: '25 Menit',
    portion: '4-5 Porsi',
    description: 'Resep sayur lodeh tradisional Indonesia yang fleksibel untuk berbagai macam jenis sayuran surplus.',
    ingredients: [
      'Paket sayuran surplus (labu siam, kacang panjang, daun melinjo, jagung)',
      '500ml Santan encer segar',
      '3 siung Bawang Merah & 2 siung Bawang Putih (iris tipis)',
      '2 buah Cabai Merah & Cabai Hijau (iris serong)',
      '2 lembar Daun Salam & 2 cm Lengkuas',
      '1 sdt Garam & 1 sdm Gula Merah serut',
    ],
    steps: [
      'Didihkan santan encer bersama bumbu iris, lengkuas, dan daun salam.',
      'Masukkan sayuran yang bertekstur keras terlebih dahulu (jagung, labu siam).',
      'Setelah setengah matang, masukkan sayuran hijau (kacang panjang, daun melinjo).',
      'Bumbui dengan garam dan gula merah, aduk perlahan agar santan tidak pecah.',
      'Angkat setelah mendidih rata dan sajikan bersama nasi hangat.',
    ],
    nutritionNote: 'Kaya beta-karoten, kalsium alami, dan serat sayuran hijau pencegah kolesterol.',
    zeroWasteTip: 'Batang kacang panjang atau labu dapat dimanfaatkan utuh tanpa dibuang ujungnya jika masih renyah.',
  },
  {
    id: 'recipe-pisang-pancake',
    ingredientKeywords: ['pisang', 'jeruk', 'roti', 'kue'],
    title: 'Pancake Pisang 3-Bahan Praktis Tanpa Gula',
    difficulty: 'Mudah',
    prepTime: '15 Menit',
    portion: '2 Porsi',
    description: 'Solusi terbaik untuk pisang surplus matang: lembut, manis alami tanpa tambahan gula buatan.',
    ingredients: [
      '2 buah Pisang Sunpride Matang (lumatkan dengan garpu)',
      '2 butir Telur ayam',
      '4 sdm Tepung terigu atau oat halus',
      '1/4 sdt Kayu manis bubuk (opsional)',
      '1 sdm Mentega untuk memanggang di wajan',
    ],
    steps: [
      'Lumatkan pisang matang di mangkuk hingga lembut merata.',
      'Kocok telur, campurkan ke dalam lumatan pisang, tambahkan tepung dan kayu manis.',
      'Panaskan wajan anti-lengket dengan sedikit mentega di api kecil.',
      'Tuang 2 sendok sayur adonan, masak hingga muncul gelembung udara, lalu balik perlahan.',
      'Masak hingga kedua sisi kecokelatan keemasan, sajikan dengan irisan buah jeruk.',
    ],
    nutritionNote: 'Tinggi kalium, triptofan pereda stres, dan energi sehat tanpa gula rafinasi.',
    zeroWasteTip: 'Pisang yang kulitnya sudah berbintik cokelat adalah yang paling manis dan sempurna untuk adonan ini!',
  },
];

/**
 * Mencari rekomendasi resep berdasarkan nama atau deskripsi item bahan baku
 */
export function getRecipeForIngredient(ingredientName: string): CulinaryRecipe {
  const lowerName = ingredientName.toLowerCase();
  
  const matched = CULINARY_RECIPES.find((recipe) =>
    recipe.ingredientKeywords.some((keyword) => lowerName.includes(keyword))
  );

  return matched || CULINARY_RECIPES[0];
}
