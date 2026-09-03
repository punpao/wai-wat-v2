/**
 * เวิร์คช็อปภูมิปัญญา — mock workshop data.
 *
 * Every workshop is anchored to a checkpoint that already exists in
 * ./locations.js, so a pin on the map and a workshop card are two views of
 * the same place. `elderIds` is a list because a workshop can be run by more
 * than one person — the detail screen has a whole tab for them.
 *
 * Cost is quoted twice on purpose: the explorer chooses to pay with the
 * แต้มภูมิปัญญา they earned, or with cash. Cash is a DEMO ONLY simulation —
 * there is no payment provider anywhere in this prototype.
 */
export const WORKSHOPS = [
  {
    id: 'ws-rbr-jar',
    title: 'ปั้นโอ่ง เขียนลายมังกร',
    craft: 'เครื่องปั้นดินเผา',
    locationId: 'loc-rbr',
    checkpointId: 'cp-rbr-1',
    elderIds: ['e-charoen'],
    icon: 'spark',
    summary: 'นวดดินสีมันปู ขึ้นรูปด้วยแป้นหมุน แล้วลองเขียนลายมังกรสดด้วยมือ',
    description:
      'เริ่มจากดูดินสีมันปูของจริงว่าต่างจากดินทั่วไปอย่างไร ลุงเจริญจะสอนนวดดินให้ได้ความเหนียวที่เข้าเตาแล้วไม่แตก จากนั้นขึ้นรูปชิ้นเล็กด้วยแป้นหมุน และปิดท้ายด้วยการเขียนลายมังกรด้วยดินติดดอกแบบไม่ร่างแบบ ชิ้นงานจะถูกเผาในเตามังกรและส่งตามไปให้ทีหลัง',
    learn: [
      'ดูความต่างของดินท้องถิ่นกับดินทั่วไป และวิธีเตรียมดิน',
      'ขึ้นรูปชิ้นงานเล็กด้วยแป้นหมุน',
      'เขียนลายมังกรด้วยดินติดดอกแบบ freehand',
      'เข้าใจว่าทำไมผิวโอ่งดินเผาถึงทำให้น้ำข้างในเย็น',
    ],
    venue: 'โรงโอ่งเรืองศิลป์ ต.เจดีย์หัก อ.เมือง จ.ราชบุรี',
    schedule: { day: 'เสาร์ที่ 12 กันยายน 2569', time: '13:00 – 16:00 น.' },
    duration: '3 ชั่วโมง',
    capacity: 15,
    baseRegistered: 9,
    cost: { points: 60, cash: 150 },
    trending: true,
  },
  {
    id: 'ws-rbr-nangyai',
    title: 'ฉลุตัวหนังใหญ่ ชุดรามเกียรติ์',
    craft: 'ศิลปะการแสดงพื้นบ้าน',
    locationId: 'loc-rbr',
    checkpointId: 'cp-rbr-2',
    elderIds: ['e-sompong', 'e-thongsuk'],
    icon: 'clips',
    summary: 'ฉลุตัวหนังจิ๋วกลับบ้านหนึ่งตัว แล้วลองเชิดหลังจอจริงกับวงปี่พาทย์',
    description:
      'ครึ่งแรกอยู่กับงานช่าง ลุงสมพงษ์จะสอนอ่านลายบนตัวหนัง ว่าลายไหนบอกยศ ลายไหนบอกตัวละคร แล้วให้ลงมือฉลุตัวหนังขนาดเล็กด้วยตุ๊ดตู่และค้อนของจริง ครึ่งหลังย้ายไปหลังจอ ลองจับตัวหนังเชิดตามจังหวะปี่พาทย์ ปิดท้ายด้วยการแสดงสั้นจากคณะเยาวชนของวัด',
    learn: [
      'อ่านความหมายของลวดลายบนตัวหนังแต่ละตัว',
      'ฉลุตัวหนังขนาดเล็กด้วยเครื่องมือช่างจริง',
      'จับตัวหนังและเชิดให้ตรงจังหวะบทพากย์',
      'ดูวิธีที่วัดส่งต่อความรู้นี้ให้เยาวชนรุ่นใหม่',
    ],
    venue: 'พิพิธภัณฑ์หนังใหญ่วัดขนอน ต.สร้อยฟ้า อ.โพธาราม จ.ราชบุรี',
    schedule: { day: 'อาทิตย์ที่ 20 กันยายน 2569', time: '09:00 – 12:30 น.' },
    duration: '3 ชั่วโมงครึ่ง',
    capacity: 12,
    baseRegistered: 5,
    cost: { points: 80, cash: 200 },
    trending: true,
  },
  {
    id: 'ws-rbr-phachok',
    title: 'จกลายดอกเซีย บนกี่ทอมือ',
    craft: 'งานหัตถกรรมสิ่งทอ',
    locationId: 'loc-rbr',
    checkpointId: 'cp-rbr-3',
    elderIds: ['e-thongsuk'],
    icon: 'medal',
    summary: 'นับเส้นด้ายและจกลายดอกเซียด้วยขนเม่น บนกี่ทอมือของจริง',
    description:
      'ป้าทองสุขจะเริ่มจากพาดูผ้าจกโบราณในพิพิธภัณฑ์ก่อน ให้เห็นว่าลายของคูบัวต่างจากดอนแร่และหนองโพอย่างไร แล้วจึงลงกี่จริง ฝึกนับเส้นยืนและจกลายดอกเซียด้วยขนเม่นทีละเส้น ได้ผ้าผืนเล็กกลับบ้านหนึ่งผืน',
    learn: [
      'แยกตระกูลลายผ้าจกไทยวนราชบุรีสามกลุ่ม',
      'นับเส้นยืนและควักเส้นด้วยขนเม่น',
      'จกลายดอกเซียจนจบหนึ่งแถว',
      'ฟังว่าผ้าแต่ละผืนใช้ในโอกาสไหนของชีวิต',
    ],
    venue: 'จิปาถะภัณฑสถานบ้านคูบัว ต.คูบัว อ.เมือง จ.ราชบุรี',
    schedule: { day: 'เสาร์ที่ 26 กันยายน 2569', time: '09:30 – 12:30 น.' },
    duration: '3 ชั่วโมง',
    capacity: 10,
    baseRegistered: 7,
    cost: { points: 70, cash: 180 },
    trending: false,
  },
  {
    id: 'ws-cnx-wood',
    title: 'แกะลายเครือเถาบนไม้สัก',
    craft: 'งานช่างล้านนา',
    locationId: 'loc-cnx',
    checkpointId: 'cp-cnx-1',
    elderIds: ['e-somchai'],
    icon: 'spark',
    summary: 'จับสิ่วครั้งแรกกับช่างแกะสลักรุ่นสุดท้ายของย่านวัวลาย',
    description:
      'ลุงสมชายจะพาดูลายเครือเถาบนหน้าบันวิหารลายคำก่อน แล้วอธิบายว่าทำไมเถาวัลย์ถึงต้องพันขึ้นข้างบนเสมอ จากนั้นกลับมาที่บ้านช่าง ฝึกจับสิ่วและแกะลายเครือเถาลงบนแผ่นไม้สักขนาดฝ่ามือ',
    learn: [
      'อ่านความหมายของลายเครือเถาแบบล้านนา',
      'จับสิ่วและใช้ค้อนไม้ให้ถูกวิธี',
      'แกะลายพื้นฐานลงบนไม้สักหนึ่งแผ่น',
    ],
    venue: 'บ้านช่างย่านวัวลาย อ.เมือง จ.เชียงใหม่',
    schedule: { day: 'เสาร์ที่ 19 กันยายน 2569', time: '13:30 – 16:30 น.' },
    duration: '3 ชั่วโมง',
    capacity: 10,
    baseRegistered: 8,
    cost: { points: 50, cash: 120 },
    trending: true,
  },
  {
    id: 'ws-skl-kopi',
    title: 'ชงโกปี๊สูตรร้านเก่าเมืองสงขลา',
    craft: 'อาหารพื้นถิ่น',
    locationId: 'loc-skl',
    checkpointId: 'cp-skl-1',
    elderIds: ['e-saowanee'],
    icon: 'flame',
    summary: 'คั่วเมล็ดกับเนยและน้ำตาล แล้วชักถุงผ้าให้ได้กลิ่นแบบร้านโบราณ',
    description:
      'ป้าเสาวณีย์เปิดร้านให้ก่อนเวลาเปิดจริง สอนตั้งแต่คั่วเมล็ดกาแฟกับเนยและน้ำตาลในกระทะเหล็ก ไปจนถึงเทคนิคชักถุงผ้าให้สูงพอที่กาแฟจะกระทบอากาศจนกลิ่นออก ปิดท้ายด้วยการชิมเทียบกับโกปี๊ที่ชงแบบสมัยใหม่',
    learn: [
      'คั่วเมล็ดแบบโบราณด้วยเนยและน้ำตาล',
      'ชงด้วยถุงผ้าและอ่านฟองบนผิวกาแฟ',
      'ชิมเทียบโกปี๊โบราณกับกาแฟสมัยใหม่',
    ],
    venue: 'ร้านโกปี๊ถนนนางงาม เมืองเก่าสงขลา',
    schedule: { day: 'อาทิตย์ที่ 13 กันยายน 2569', time: '07:30 – 10:00 น.' },
    duration: '2 ชั่วโมงครึ่ง',
    capacity: 14,
    baseRegistered: 4,
    cost: { points: 40, cash: 100 },
    trending: false,
  },
]

export const workshopById = (id) => WORKSHOPS.find((w) => w.id === id)

export const workshopsByLocation = (locationId) =>
  WORKSHOPS.filter((w) => w.locationId === locationId)

/** The workshop held at a map pin, if there is one. */
export const workshopByCheckpoint = (checkpointId) =>
  WORKSHOPS.find((w) => w.checkpointId === checkpointId)

/** What to show before an area is picked. */
export const trendingWorkshops = () => WORKSHOPS.filter((w) => w.trending)

/**
 * What to offer someone who has just finished listening at a checkpoint.
 *
 * Nearest match first: the class held at this very pin, then anything else
 * the same elder teaches, then the rest of that trail. Some trails teach
 * nothing yet, and ending a story with an empty space is worse than an honest
 * "from another area" — so a trending class is the floor. `reason` lets the
 * card say why this one is being shown instead of pretending it is a
 * coincidence.
 */
export function recommendedWorkshop({ checkpointId, elderId, locationId } = {}) {
  const here = WORKSHOPS.find((w) => w.checkpointId === checkpointId)
  if (here) return { workshop: here, reason: 'here' }

  const byElder = elderId && WORKSHOPS.find((w) => w.elderIds.includes(elderId))
  if (byElder) return { workshop: byElder, reason: 'elder' }

  const nearby = locationId && WORKSHOPS.find((w) => w.locationId === locationId)
  if (nearby) return { workshop: nearby, reason: 'nearby' }

  const elsewhere = trendingWorkshops()[0]
  return elsewhere ? { workshop: elsewhere, reason: 'trending' } : null
}
