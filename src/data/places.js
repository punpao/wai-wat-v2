/**
 * สถานที่ที่เปิดให้บริการ AR — mock data for กาลวัฒ.
 *
 * One place = one card on the home feed. A `live` place carries a map image,
 * an ordered list of checkpoints, and the journey script played at each one.
 * Everything else is `soon`: browsable, not yet walkable.
 *
 * A journey is a flat list of beats. The player walks them in order and each
 * beat names the one thing it needs from the screen, so adding a stop to the
 * tour is adding an object here, not a new component.
 *
 *   scan     wait at a scene until the visitor scans it
 *   narrate  the narrator talks over a scene, one line at a time
 *   reveal   the scene swaps and the puppet lifts out of it, draggable
 *   photo    keep the puppet, add a frame, save or share the picture
 *   show     the puppet troupe performs, frames cycling
 *   done     end of this checkpoint
 *
 * `pose` on a line picks the narrator cut-out shown while it is read —
 * that is the whole animation: ten stills from one photo sheet, swapped.
 */

export const NARRATOR = {
  id: 'lung-kanon',
  name: 'ลุงวิรัช',
  role: 'ปราชญ์ชุมชนวัดขนอน',
  poses: [
    'wai',
    'explain',
    'think',
    'idle',
    'point',
    'point_far',
    'point_close',
    'point_both',
    'thumbs_up',
    'point_thumb',
  ],
}

export const narratorPose = (pose) => `/kanon/narrator/${pose}.png`

const kanonJourney = {
  /* ── จุดที่ 1 · พิพิธภัณฑ์หนังใหญ่วัดขนอน ─────────────────────── */
  'cp-museum': [
    {
      id: 'm-scan',
      type: 'scan',
      scene: '/kanon/scene/museum.jpg',
      title: 'พิพิธภัณฑ์หนังใหญ่วัดขนอน',
      hint: 'เล็งกล้องไปที่ป้ายหน้าพิพิธภัณฑ์ แล้วกดสแกน',
      cta: 'สแกนป้ายพิพิธภัณฑ์',
    },
    {
      id: 'm-intro',
      type: 'narrate',
      scene: '/kanon/scene/museum.jpg',
      lines: [
        { pose: 'wai', text: 'สวัสดีครับ ลุงวิรัชเองครับ อยู่วัดขนอนมาตั้งแต่เกิด' },
        { pose: 'explain', text: 'ที่นี่คือพิพิธภัณฑ์หนังใหญ่วัดขนอน เก็บตัวหนังดั้งเดิมไว้ ๓๑๓ ตัว' },
        { pose: 'think', text: 'หนังใหญ่คือการเล่าเรื่องด้วยเงา ใช้หนังวัวทั้งผืนมาฉลุเป็นตัวละคร' },
        { pose: 'explain', text: 'สมัยรัชกาลที่ ๕ หลวงปู่กล่อมชวนช่างในหมู่บ้านมาสร้างไว้ ชุดแรกคือหนุมานถวายแหวน' },
        { pose: 'point_thumb', text: 'ที่พิเศษคือวัดเราไม่ได้เก็บไว้ในตู้เฉย ๆ เรายังสอนเด็กให้เชิดต่อจนวันนี้' },
      ],
    },
    {
      id: 'm-walk-in',
      type: 'narrate',
      scene: '/kanon/scene/spot_before.jpg',
      lines: [
        { pose: 'point_far', text: 'เดินตามลุงเข้ามาข้างในก่อนครับ' },
        { pose: 'point', text: 'ตรงนี้เป็นป้ายเล่าเรื่องชุดพระนครไหว ลองดูตัวใหญ่ตรงกลางสิ' },
        { pose: 'point_close', text: 'ลองสแกนตัวนั้นดูสิครับ เดี๋ยวมันมีอะไรให้ดู' },
      ],
    },
    {
      id: 'm-scan-spot',
      type: 'scan',
      scene: '/kanon/scene/spot_before.jpg',
      title: 'ชุดพระนครไหว',
      hint: 'เล็งไปที่ตัวหนังใหญ่ตรงกลางป้าย',
      cta: 'สแกนตัวหนัง',
    },
    {
      id: 'm-reveal',
      type: 'reveal',
      scene: '/kanon/scene/spot_after.jpg',
      puppet: '/kanon/puppet/interact.png',
      lines: [
        { pose: 'explain', text: 'นี่คือตัวหนังชุดพระนครไหว ตัวเดียวใช้หนังวัวเกือบทั้งผืน' },
        { pose: 'think', text: 'ช่างต้องฉลุทีละรู ตัวใหญ่ขนาดนี้ทำกันเป็นเดือน' },
        { pose: 'point', text: 'ลองลากดูสิครับ จับมันขยับได้เหมือนตอนคนเชิดจับจริง ๆ' },
      ],
      interactHint: 'ลากเพื่อขยับตัวหนัง',
    },
    {
      id: 'm-photo',
      type: 'photo',
      scene: '/kanon/scene/spot_after.jpg',
      puppet: '/kanon/puppet/interact.png',
      lines: [
        { pose: 'thumbs_up', text: 'ถ่ายรูปคู่กับตัวหนังเก็บไว้หน่อยสิครับ' },
      ],
    },
    {
      id: 'm-lead-out',
      type: 'narrate',
      scene: '/kanon/scene/museum.jpg',
      lines: [
        { pose: 'point_both', text: 'ดูในพิพิธภัณฑ์พอหอมปากหอมคอแล้ว ทีนี้ไปดูของจริงกัน' },
        { pose: 'point_far', text: 'เดินออกไปทางนั้น จะเจอโรงมหรสพหนังใหญ่ เดี๋ยวลุงตามไปเจอ' },
      ],
    },
    { id: 'm-done', type: 'done', next: 'cp-theater' },
  ],

  /* ── จุดที่ 2 · โรงมหรสพหนังใหญ่วัดขนอน ──────────────────────── */
  'cp-theater': [
    {
      id: 't-scan',
      type: 'scan',
      scene: '/kanon/scene/theater_outside.jpg',
      title: 'โรงมหรสพหนังใหญ่วัดขนอน',
      hint: 'เล็งกล้องไปที่หน้าจั่วโรงมหรสพ',
      cta: 'สแกนหน้าโรงมหรสพ',
    },
    {
      id: 't-intro',
      type: 'narrate',
      scene: '/kanon/scene/theater_outside.jpg',
      lines: [
        { pose: 'explain', text: 'มาถึงโรงมหรสพแล้วครับ ที่นี่แสดงจริงทุกเสาร์' },
        { pose: 'think', text: 'หนังใหญ่ไม่เหมือนหนังตะลุงนะครับ ตัวหนังใหญ่กว่ามาก และขยับไม่ได้' },
        { pose: 'explain', text: 'ตัวหนังแข็งทั้งตัว คนเชิดจึงต้องเต้นเอง ใช้ทั้งตัวเล่าเรื่องแทน' },
        { pose: 'point_thumb', text: 'เอกลักษณ์คือคนเชิด ปี่พาทย์ และคนพากย์ ต้องไปพร้อมกันเป๊ะ ๆ' },
        { pose: 'point_far', text: 'เข้าไปข้างในเลยครับ เดี๋ยวมีของดีให้ดู' },
      ],
    },
    {
      id: 't-scan-stage',
      type: 'scan',
      scene: '/kanon/scene/theater_stage.jpg',
      title: 'เวทีจอหนังใหญ่',
      hint: 'เล็งไปที่จอผ้าขาวหลังเวที',
      cta: 'สแกนเวที',
    },
    {
      id: 't-show',
      type: 'show',
      scene: '/kanon/scene/theater_stage.jpg',
      frames: [
        '/kanon/puppet/show_1.png',
        '/kanon/puppet/show_2.png',
        '/kanon/puppet/show_3.png',
        '/kanon/puppet/show_4.png',
      ],
      lines: [
        { pose: 'explain', text: 'ดูเงาหลังจอสิครับ นั่นคือการเชิดจริง' },
        { pose: 'think', text: 'คนเชิดต้องย่อตัว ก้าวตามจังหวะกลอง ไม่ใช่แค่ยกหนังขึ้นเฉย ๆ' },
        { pose: 'thumbs_up', text: 'กว่าจะเชิดได้สวยแบบนี้ เด็กวัดเราฝึกกันเป็นปีครับ' },
      ],
    },
    { id: 't-done', type: 'done', next: null },
  ],
}

export const PLACES = [
  {
    id: 'kanon',
    status: 'live',
    name: 'วัดขนอน',
    subtitle: 'หนังใหญ่วัดขนอน',
    province: 'ราชบุรี',
    district: 'อ.โพธาราม',
    craft: 'หนังใหญ่',
    cover: '/kanon/scene/museum.jpg',
    teaser: 'ตัวหนังดั้งเดิม ๓๑๓ ตัว กับโรงมหรสพที่ยังเชิดจริงทุกสัปดาห์',
    about:
      'วัดขนอนเก็บรักษาตัวหนังใหญ่ดั้งเดิมที่สร้างในสมัยรัชกาลที่ ๕ ไว้ ๓๑๓ ตัว และไม่ได้เก็บไว้เฉย ๆ — วัดยังฝึกเยาวชนให้ทำตัวหนังและเชิดจริงจนถึงวันนี้ จนได้รับการยกย่องจาก UNESCO ให้เป็นแนวปฏิบัติที่ดีในการรักษามรดกวัฒนธรรมที่จับต้องไม่ได้',
    highlights: [
      'ตัวหนังดั้งเดิม ๓๑๓ ตัว ชุดแรกคือหนุมานถวายแหวน',
      'โรงมหรสพที่ยังมีคณะเยาวชนเชิดจริง',
      'ปราชญ์ชุมชนพาชมตลอดเส้นทาง',
    ],
    duration: 'ราว 20 นาที',
    map: '/kanon/scene/map.jpg',
    checkpoints: [
      {
        id: 'cp-museum',
        order: 1,
        name: 'พิพิธภัณฑ์หนังใหญ่วัดขนอน',
        short: 'พิพิธภัณฑ์',
        blurb: 'จุดเริ่มต้น — ฟังที่มาของหนังใหญ่ และปลุกตัวหนังชุดพระนครไหว',
        lat: 13.6842,
        lng: 99.8571,
        // where the pin sits on map.jpg, in percent
        pin: { x: 39, y: 43 },
      },
      {
        id: 'cp-theater',
        order: 2,
        name: 'โรงมหรสพหนังใหญ่วัดขนอน',
        short: 'โรงมหรสพ',
        blurb: 'ดูการเชิดจริงหลังจอ และจองรอบเวิร์กช็อปกับปราชญ์',
        lat: 13.6849,
        lng: 99.8585,
        pin: { x: 79, y: 67 },
      },
    ],
    journey: kanonJourney,
  },

  /* Browsable, not yet walkable — the field these would be built out from
     already exists in this repo's earlier trail data. */
  {
    id: 'rbr-jar',
    status: 'soon',
    name: 'โรงโอ่งเรืองศิลป์',
    subtitle: 'โอ่งมังกรราชบุรี',
    province: 'ราชบุรี',
    district: 'อ.เมือง',
    craft: 'เครื่องปั้นดินเผา',
    teaser: 'เตามังกรที่ยังเผาจริง กับลายมังกรที่เขียนสดด้วยมือ',
  },
  {
    id: 'rbr-chok',
    status: 'soon',
    name: 'จิปาถะภัณฑสถานบ้านคูบัว',
    subtitle: 'ผ้าจกไทยวน',
    province: 'ราชบุรี',
    district: 'อ.เมือง',
    craft: 'ผ้าทอ',
    teaser: 'ลายดอกเซียที่ช่างจำไว้ในหัว ไม่มีแบบให้ลอก',
  },
  {
    id: 'cnx-wualai',
    status: 'soon',
    name: 'ย่านวัวลาย',
    subtitle: 'เครื่องเงินเชียงใหม่',
    province: 'เชียงใหม่',
    district: 'อ.เมือง',
    craft: 'เครื่องเงิน',
    teaser: 'เสียงค้อนตอกลายเงินที่ยังดังอยู่ในตรอกเดิม',
  },
  {
    id: 'skl-old-town',
    status: 'soon',
    name: 'เมืองเก่าสงขลา',
    subtitle: 'ถนนนางงาม',
    province: 'สงขลา',
    district: 'อ.เมือง',
    craft: 'วิถีชุมชน',
    teaser: 'ตึกชิโนโปรตุกีสกับร้านโกปี๊ที่เปิดมาตั้งแต่รุ่นพ่อ',
  },
]

export const placeById = (id) => PLACES.find((p) => p.id === id)

export const livePlaces = () => PLACES.filter((p) => p.status === 'live')

export const checkpointById = (place, cpId) =>
  place?.checkpoints?.find((c) => c.id === cpId)

export const beatsFor = (place, cpId) => place?.journey?.[cpId] ?? []

/** The workshop offered once the tour is finished. */
export const KANON_WORKSHOP = {
  id: 'ws-kanon-chid',
  title: 'ฝึกเชิดหนังใหญ่กับปราชญ์วัดขนอน',
  venue: 'โรงมหรสพหนังใหญ่วัดขนอน อ.โพธาราม จ.ราชบุรี',
  teacher: 'ลุงวิรัช และคณะเยาวชนวัดขนอน',
  duration: '2 ชั่วโมง',
  summary: 'จับตัวหนังจริง ฝึกย่อตัวและก้าวตามจังหวะกลอง แล้วลองเชิดหลังจอเอง',
  learn: [
    'จับและยกตัวหนังให้ถูกท่า',
    'ย่อตัวและก้าวตามจังหวะปี่พาทย์',
    'ลองเชิดหลังจอจริงหนึ่งรอบ',
  ],
  price: 350,
  slots: [
    { id: 'sl-1', day: 'เสาร์ที่ 19 กันยายน 2569', time: '10:00 – 12:00 น.', seats: 12, taken: 7 },
    { id: 'sl-2', day: 'อาทิตย์ที่ 20 กันยายน 2569', time: '14:00 – 16:00 น.', seats: 12, taken: 3 },
    { id: 'sl-3', day: 'เสาร์ที่ 26 กันยายน 2569', time: '10:00 – 12:00 น.', seats: 12, taken: 11 },
  ],
}
