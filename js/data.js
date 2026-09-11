// ==========================================
// DATA ORANG
// ==========================================
// Struktur:
//   - name, role, born, location, kelas
//   - photoSeed  → dipakai buat generate avatar default (ui-avatars.com)
//   - intro      → HTML string, tampil di terminal
//   - works      → array karya
//   - skills     → array skill dengan persen
//   - tools      → array tools
//   - contacts   → array kontak dengan url
//   - hobbies    → array hobi
//   - music      → objek musik + playlist (playlist awalnya kosong)
//
// CARA NAMBAHIN LAGU:
//   Isi array `playlist` di bawah, contoh:
//     playlist: [
//       { title: "Judul", artist: "Artis", duration: "3:24", emoji: "🌙" },
//       { title: "Judul 2", artist: "Artis 2", duration: "4:01", emoji: "🎵" }
//     ]
//
//   File audio bisa lu upload nanti dari UI (tombol upload).
//   File yang lu upload bakal di-save di localStorage sesuai nama orang + judul lagu.

const PEOPLE = [
  {
    name: "Abid Hanif Abqary",
    role: "AI Developer & Data Science",
    born: "Gresik, 13 Februari 2011",
    location: "Malang, Jawa Timur",
    kelas: "X-B",
    photoSeed: "Abid+Hanif&background=1a2235&color=00C2FF&bold=true&size=400",
    tags: ["Coding", "Gaming", "Novelist"],
    intro: "Halo, perkenalkan namaku <strong>Abid Hanif Abqary</strong>. Aku suka mencoba hal baru seperti membuat AI. Salah satu ideku adalah AI Sales Agent yang terintegrasi langsung dengan website toko online. Dan aku juga suka menulis novel. Salah satu novel buatanku adalah Date or Fail.",
    works: [
      { title: "Rhavenfire Classhub", desc: "Aplikasi administrasi kelas sederhana, dipakai uji coba di kelas X-B.", link: "https://classhub-rhavenfire.bolt.host/", stack: ["HTML", "CSS", "TSX"] },
      { title: "Website Portofolio Mandiri", desc: "Website portofolio saya", link: "abid-hanif-abqary.bolt.host", stack: ["HTML", "CSS", "TSX"] },
      { title: "AI Sandbox simulator", desc: "Dunia Sandbox simulasi kehidupan di dunia fantasi dan AI hidup didalamnya", link: "evoworld-ai-civiliza-lkif.bolt.host/", stack: ["Vite", "React", "TS"] }
    ],
    skills: [
      { name: "Python", pct: 82 },
      { name: "JavaScript", pct: 75 },
      { name: "MySQL / Database", pct: 70 },
      { name: "HTML & CSS", pct: 88 }
    ],
    tools: ["VS Code", "Git & GitHub", "Vercel", "XAMPP", "Figma"],
    contacts: [
      { platform: "Instagram", handle: "@abidhanifabqary", icon: "IG", url: "https://instagram.com/abidhanifabqary" },
      { platform: "GitHub", handle: "github.com/AbidHanif-1294", icon: "GH", url: "https://github.com/abidhn" },
      { platform: "Email", handle: "abidhanifmtsn@email.com", icon: "@", url: "mailto:abidhanifmtsn@email.com" },
      { platform: "WhatsApp", handle: "0817-4721-097", icon: "WA", url: "https://wa.me/628174721097" }
    ],
    hobbies: [
      { emoji: "🎮", title: "Gaming", desc: "Suka main game strategi dan sesekali ngoding mod kecil-kecilan." },
      { emoji: "📖", title: "Novelist", desc: "Penulis novel pemula" },
      { emoji: "📺", title: "Nonton tutorial", desc: "Hobi nonton video coding dan bikin ulang projectnya." },
      { emoji: "🎧", title: "Musik lo-fi", desc: "Dengerin lo-fi kalau lagi ngoding biar fokus." }
    ],
    music: {
      title: "Lo-fi Coding Beats",
      artist: "Playlist favorit",
      emoji: "🎧",
      note: "Diputar hampir tiap malam pas lagi ngoding project.",
      playlist: [
        // Tambahin lagu di sini bro, formatnya:
        // { title: "Judul", artist: "Artis", duration: "3:24", emoji: "🌙" },
      ]
    }
  },

  {
    name: "Antariksa Awali Asyraaf Setyo Widad",
    role: "UI/UX Designer & Frontend",
    born: "Malang, 21 Agustus 2011",
    location: "Malang, Jawa Timur",
    kelas: "X-B",
    photoSeed: "Antariksa+Awali&background=1a1e35&color=7C4DFF&bold=true&size=400",
    tags: ["Desain", "Ilustrasi", "K-Pop"],
    intro: "Hai, aku <strong>Antariksa Awali Asyraaf Setyo Widad</strong>. Aku senang mendesain antarmuka yang enak dilihat dan gampang dipakai. Suka corat-coret di Figma sebelum akhirnya diubah jadi kode beneran.",
    works: [
      { title: "Desain Ulang Web Perpustakaan Sekolah", desc: "Rombak tampilan katalog perpustakaan biar lebih ramah pengguna.", link: "figma.com/antariksa/perpus", stack: ["Figma", "HTML/CSS"] },
      { title: "Landing Page Ekskul Seni", desc: "Halaman promosi untuk ekstrakurikuler seni dan desain sekolah.", link: "github.com/antariksa/ekskul-seni", stack: ["React", "Tailwind"] },
      { title: "Ilustrasi Mading Digital", desc: "Kumpulan ilustrasi untuk mading digital kelas X-B.", link: "behance.net/antariksa", stack: ["Procreate"] }
    ],
    skills: [
      { name: "UI/UX Design", pct: 85 },
      { name: "Figma", pct: 90 },
      { name: "HTML & CSS", pct: 72 },
      { name: "React (dasar)", pct: 55 }
    ],
    tools: ["Figma", "Canva", "Procreate", "VS Code", "Notion"],
    contacts: [
      { platform: "Instagram", handle: "@antariksa.aw", icon: "IG", url: "https://instagram.com/antariksa.aw" },
      { platform: "Behance", handle: "behance.net/antariksa", icon: "BE", url: "https://behance.net/antariksa" },
      { platform: "Email", handle: "antariksa.awali@email.com", icon: "@", url: "mailto:antariksa.awali@email.com" },
      { platform: "WhatsApp", handle: "0813-xxxx-3344", icon: "WA", url: "https://wa.me/62813xxxx3344" }
    ],
    hobbies: [
      { emoji: "🎨", title: "Menggambar digital", desc: "Suka bikin ilustrasi karakter tiap akhir pekan." },
      { emoji: "🎵", title: "K-Pop", desc: "Fans berat salah satu grup, hafal koreo beberapa lagu." },
      { emoji: "📓", title: "Jurnal & bullet journal", desc: "Rajin nulis jurnal harian yang dihias sendiri." },
      { emoji: "🛍️", title: "Thrifting", desc: "Suka cari baju unik di pasar loak akhir pekan." }
    ],
    music: {
      title: "Playlist K-Pop Favorit",
      artist: "Mixtape pribadi",
      emoji: "🎵",
      note: "Lagu wajib pas lagi ngedesain di Figma.",
      playlist: [
        // Tambahin lagu di sini bro
      ]
    }
  },

  {
    name: "Ahmad Fauzan Pratama",
    role: "Data Science & AI Enthusiast",
    born: "Gresik, 13 Februari 2011",
    location: "Malang, Jawa Timur",
    kelas: "X-B",
    photoSeed: "Ahmad+Fauzan&background=1a2a1f&color=38e07a&bold=true&size=400",
    tags: ["AI", "Data", "Catur"],
    intro: "Halo semua, aku <strong>Ahmad Fauzan Pratama</strong>. Aku tertarik banget sama machine learning dan analisis data, suka utak-atik dataset kecil buat cari pola menarik di dalamnya.",
    works: [
      { title: "Prediksi Nilai Ujian Sederhana", desc: "Model regresi kecil untuk memprediksi nilai ujian berdasarkan jam belajar.", link: "github.com/fauzan/prediksi-nilai", stack: ["Python", "Scikit-learn"] },
      { title: "Chatbot FAQ Sekolah", desc: "Chatbot sederhana untuk menjawab pertanyaan umum seputar sekolah.", link: "github.com/fauzan/chatbot-faq", stack: ["Python", "NLTK"] },
      { title: "Dashboard Nilai Kelas", desc: "Visualisasi data nilai kelas X-B per semester.", link: "github.com/fauzan/dashboard-nilai", stack: ["Python", "Pandas", "Plotly"] }
    ],
    skills: [
      { name: "Python", pct: 88 },
      { name: "Machine Learning (dasar)", pct: 65 },
      { name: "Data Analysis", pct: 78 },
      { name: "SQL", pct: 60 }
    ],
    tools: ["Jupyter Notebook", "VS Code", "Google Colab", "Git & GitHub", "Excel"],
    contacts: [
      { platform: "Instagram", handle: "@fauzan.nw", icon: "IG", url: "https://instagram.com/fauzan.nw" },
      { platform: "GitHub", handle: "github.com/fauzannw", icon: "GH", url: "https://github.com/fauzannw" },
      { platform: "Email", handle: "ahmad.fauzan@email.com", icon: "@", url: "mailto:ahmad.fauzan@email.com" },
      { platform: "LinkedIn", handle: "linkedin.com/in/fauzannw", icon: "IN", url: "https://linkedin.com/in/fauzannw" }
    ],
    hobbies: [
      { emoji: "♟️", title: "Catur", desc: "Aktif di klub catur sekolah, suka analisis pertandingan grandmaster." },
      { emoji: "📚", title: "Menulis novel", desc: "Sedang menulis novel fiksi ilmiah di waktu luang." },
      { emoji: "🧩", title: "Puzzle logika", desc: "Suka ngerjain teka-teki logika dan soal olimpiade matematika." },
      { emoji: "☕", title: "Kopi susu", desc: "Ga bisa ngoding tanpa segelas kopi susu di meja." }
    ],
    music: {
      title: "Lagu buat Fokus Ngoding",
      artist: "Instrumental favorit",
      emoji: "🎹",
      note: "Instrumental tanpa lirik biar tetap konsen pas analisis data.",
      playlist: [
        // Tambahin lagu di sini bro
      ]
    }
  }
];

// ==========================================
// TAB
// ==========================================
const TABS = [
  { id: "perkenalan", label: "Perkenalan" },
  { id: "karya", label: "Karya" },
  { id: "skill", label: "Skill & Tools" },
  { id: "musik", label: "Musik" },
  { id: "kontak", label: "Kontak" },
  { id: "hobi", label: "Hobi" }
];
