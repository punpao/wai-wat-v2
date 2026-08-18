/**
 * ผู้เฒ่าผู้ให้ความรู้ (Elder contributors) — mock data.
 * `sprite` picks the illustrated character variant in <ElderSprite />.
 */
export const ELDERS = [
  {
    id: 'e-somchai',
    name: 'ลุงสมชาย ใจดี',
    short: 'ลุงสมชาย',
    age: 72,
    area: 'เชียงใหม่',
    craft: 'ช่างแกะสลักไม้ รุ่นสุดท้ายของย่านวัวลาย',
    sprite: { skin: '#E7B48A', shirt: '#D9502F', hair: '#EDEDED', accessory: 'hat' },
  },
  {
    id: 'e-boonma',
    name: 'ป้าบุญมา ศรีทอง',
    short: 'ป้าบุญมา',
    age: 68,
    area: 'เชียงใหม่',
    craft: 'แม่ครัวขนมไทยโบราณ ตลาดวโรรส 40 ปี',
    sprite: { skin: '#EFC29B', shirt: '#F16C95', hair: '#F3F3F3', accessory: 'bun' },
  },
  {
    id: 'e-prasit',
    name: 'ตาประสิทธิ์ วงศ์ไทย',
    short: 'ตาประสิทธิ์',
    age: 79,
    area: 'พระนคร',
    craft: 'อดีตครูโรงเรียนวัด เล่าเรื่องคลองเก่ากรุงเทพฯ',
    sprite: { skin: '#DCA57C', shirt: '#653877', hair: '#FFFFFF', accessory: 'glasses' },
  },
  {
    id: 'e-lamyai',
    name: 'ยายลำไย ดอกไม้',
    short: 'ยายลำไย',
    age: 81,
    area: 'พระนคร',
    craft: 'ร้อยมาลัยดอกไม้สดที่ปากคลองตลาดมาตั้งแต่สาว',
    sprite: { skin: '#E8B58D', shirt: '#FFD3A2', hair: '#FAFAFA', accessory: 'flower' },
  },
  {
    id: 'e-thongdee',
    name: 'ลุงทองดี เรือนงาม',
    short: 'ลุงทองดี',
    age: 75,
    area: 'พระนครศรีอยุธยา',
    craft: 'คนพายเรือรับจ้าง รู้ทางน้ำอยุธยาทุกสาย',
    sprite: { skin: '#D79A70', shirt: '#B38CC0', hair: '#EFEFEF', accessory: 'hat' },
  },
  {
    id: 'e-saowanee',
    name: 'ป้าเสาวณีย์ ทะเลใต้',
    short: 'ป้าเสาวณีย์',
    age: 70,
    area: 'สงขลา',
    craft: 'เจ้าของร้านโกปี๊เก่าแก่ในเมืองเก่าสงขลา',
    sprite: { skin: '#E5AE85', shirt: '#D9502F', hair: '#F0F0F0', accessory: 'bun' },
  },
]

export const elderById = (id) => ELDERS.find((e) => e.id === id)
