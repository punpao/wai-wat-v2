/**
 * ผู้สูงอายุผู้ให้ความรู้ (Elder contributors) — mock data.
 *
 * `sprite` picks the illustrated character variant in <ElderSprite />.
 * `photo` is optional: a real photograph, served from `public/elders/`,
 *   which <ElderPhoto /> stages over the camera feed in place of the
 *   drawing. Anyone without one keeps the sprite, so photos can land one
 *   elder at a time. See public/elders/README.md for what to hand in.
 */
export const ELDERS = [
  {
    id: 'e-somchai',
    name: 'ลุงสมชาย ใจดี',
    photo: '/elders/e-thongsuk.png',
    short: 'ลุงสมชาย',
    age: 72,
    area: 'เชียงใหม่',
    craft: 'ช่างแกะสลักไม้ รุ่นสุดท้ายของย่านวัวลาย',
    sprite: { skin: '#E7B48A', shirt: '#D9502F', hair: '#EDEDED', accessory: 'hat' },
  },
  {
    id: 'e-boonma',
    name: 'ป้าบุญมา ศรีทอง',
    photo: '/elders/e-thongsuk.png',
    short: 'ป้าบุญมา',
    age: 68,
    area: 'เชียงใหม่',
    craft: 'แม่ครัวขนมไทยโบราณ ตลาดวโรรส 40 ปี',
    sprite: { skin: '#EFC29B', shirt: '#F16C95', hair: '#F3F3F3', accessory: 'bun' },
  },
  {
    id: 'e-prasit',
    name: 'ตาประสิทธิ์ วงศ์ไทย',
    photo: '/elders/e-thongsuk.png',
    short: 'ตาประสิทธิ์',
    age: 79,
    area: 'พระนคร',
    craft: 'อดีตครูโรงเรียนวัด เล่าเรื่องคลองเก่ากรุงเทพฯ',
    sprite: { skin: '#DCA57C', shirt: '#653877', hair: '#FFFFFF', accessory: 'glasses' },
  },
  {
    id: 'e-lamyai',
    name: 'ยายลำไย ดอกไม้',
    photo: '/elders/e-thongsuk.png',
    short: 'ยายลำไย',
    age: 81,
    area: 'พระนคร',
    craft: 'ร้อยมาลัยดอกไม้สดที่ปากคลองตลาดมาตั้งแต่สาว',
    sprite: { skin: '#E8B58D', shirt: '#FFD3A2', hair: '#FAFAFA', accessory: 'flower' },
  },
  {
    id: 'e-thongdee',
    name: 'ลุงทองดี เรือนงาม',
    photo: '/elders/e-thongsuk.png',
    short: 'ลุงทองดี',
    age: 75,
    area: 'พระนครศรีอยุธยา',
    craft: 'คนพายเรือรับจ้าง รู้ทางน้ำอยุธยาทุกสาย',
    sprite: { skin: '#D79A70', shirt: '#B38CC0', hair: '#EFEFEF', accessory: 'hat' },
  },
  {
    id: 'e-saowanee',
    name: 'ป้าเสาวณีย์ ทะเลใต้',
    photo: '/elders/e-thongsuk.png',
    short: 'ป้าเสาวณีย์',
    age: 70,
    area: 'สงขลา',
    craft: 'เจ้าของร้านโกปี๊เก่าแก่ในเมืองเก่าสงขลา',
    sprite: { skin: '#E5AE85', shirt: '#D9502F', hair: '#F0F0F0', accessory: 'bun' },
  },
  {
    id: 'e-charoen',
    name: 'ลุงเจริญ ใจสุข',
    photo: '/elders/e-thongsuk.png',
    short: 'ลุงเจริญ',
    age: 66,
    area: 'ราชบุรี',
    craft: 'ช่างปั้นโอ่งมังกร สืบทอดฝีมือช่างจีนรุ่นปู่ที่โรงโอ่งเรืองศิลป์',
    sprite: { skin: '#E7B48A', shirt: '#F16C95', hair: '#EDEDED', accessory: 'hat' },
  },
  {
    id: 'e-sompong',
    photo: '/elders/e-thongsuk.png',
    name: 'ลุงสมพงษ์ ฉลุลาย',
    short: 'ลุงสมพงษ์',
    age: 71,
    area: 'ราชบุรี',
    craft: 'ช่างฉลุหนังใหญ่วัดขนอน ผู้สืบทอดตัวหนังชุดรามเกียรติ์',
    sprite: { skin: '#DCA57C', shirt: '#653877', hair: '#FFFFFF', accessory: 'glasses' },
  },
  {
    id: 'e-thongsuk',
    photo: '/elders/e-thongsuk.png',
    name: 'ป้าทองสุข ทอลาย',
    short: 'ป้าทองสุข',
    age: 69,
    area: 'ราชบุรี',
    craft: 'ช่างทอผ้าจกไทยวน สืบทอดลายดอกเซียและลายหักนกคู่',
    sprite: { skin: '#EFC29B', shirt: '#FFD3A2', hair: '#F3F3F3', accessory: 'bun' },
  },
]

export const elderById = (id) => ELDERS.find((e) => e.id === id)
