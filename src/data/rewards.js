/** บริการสวัสดิการที่แลกได้ด้วยแต้มภูมิปัญญา (mock catalog) */
export const REWARDS = [
  {
    id: 'rw-hospital',
    name: 'พาไปโรงพยาบาล',
    cost: 300,
    unit: 'ต่อ 1 เที่ยว',
    detail: 'อาสาสมัครรับ-ส่งถึงบ้าน พร้อมช่วยยื่นบัตรและรอคิวให้',
    provider: 'เครือข่ายอาสาสมัครชุมชน',
    icon: 'hospital',
  },
  {
    id: 'rw-clean',
    name: 'ทำความสะอาดบ้าน',
    cost: 450,
    unit: 'ต่อ 3 ชั่วโมง',
    detail: 'ทีมทำความสะอาด 2 คน เช็ดถู ซักผ้า จัดของ ให้ครึ่งวัน',
    provider: 'วิสาหกิจชุมชนบ้านสะอาด',
    icon: 'broom',
  },
  {
    id: 'rw-haircut',
    name: 'ตัดผมที่บ้าน',
    cost: 200,
    unit: 'ต่อ 1 ครั้ง',
    detail: 'ช่างตัดผมเดินทางไปหาถึงบ้าน สระ ตัด ไดร์ ครบ',
    provider: 'ร้านตัดผมในย่าน',
    icon: 'scissors',
  },
  {
    id: 'rw-checkup',
    name: 'ตรวจสุขภาพถึงบ้าน',
    cost: 600,
    unit: 'ต่อ 1 ครั้ง',
    detail: 'พยาบาลวิชาชีพวัดความดัน เจาะน้ำตาล และประเมินการใช้ยา',
    provider: 'ศูนย์บริการสาธารณสุข',
    icon: 'stethoscope',
  },
]

/** เหรียญตราสำหรับผู้สำรวจ (User role gamification) */
export const BADGES = [
  { id: 'bd-first', name: 'ก้าวแรก', detail: 'ค้นพบจุดแรกสำเร็จ', need: 1 },
  { id: 'bd-three', name: 'นักเดินทาง', detail: 'ค้นพบครบ 3 จุด', need: 3 },
  { id: 'bd-five', name: 'นักสะสมเรื่องเล่า', detail: 'ค้นพบครบ 5 จุด', need: 5 },
  { id: 'bd-eight', name: 'ผู้รักษาภูมิปัญญา', detail: 'ค้นพบครบ 8 จุด', need: 8 },
  { id: 'bd-all', name: 'ตำนานเส้นทาง', detail: 'ค้นพบครบ 12 จุด', need: 12 },
]

export const LEVELS = [
  { level: 1, name: 'ผู้เริ่มเดิน', min: 0 },
  { level: 2, name: 'ผู้สังเกต', min: 80 },
  { level: 3, name: 'ผู้ฟัง', min: 200 },
  { level: 4, name: 'ผู้เล่าต่อ', min: 380 },
  { level: 5, name: 'ผู้รักษาเรื่อง', min: 600 },
]

export const levelFor = (points) =>
  [...LEVELS].reverse().find((l) => points >= l.min) ?? LEVELS[0]

export const nextLevel = (points) => LEVELS.find((l) => points < l.min) ?? null
