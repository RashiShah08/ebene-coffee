/**
 * Everything the counter sells, plus the beans behind it.
 *
 * Prices are whole rupees — there is no paise anywhere in the room, so there is
 * no fractional money in the code either.
 */

export const CATEGORIES = [
  { id: 'all', label: 'Everything' },
  { id: 'espresso', label: 'Espresso bar' },
  { id: 'milk', label: 'Milk & sweet' },
  { id: 'cold', label: 'Cold' },
  { id: 'other', label: 'Not coffee' },
]

/**
 * `img` is the basename of the photograph in src/assets. It lives on the drink
 * rather than in a lookup table keyed by name, so renaming a drink can never
 * silently orphan its picture.
 */
export const DRINKS = [
  { no: 'No. 01', name: 'The House Espresso', img: 'house-espresso', notes: 'Dark chocolate · burnt caramel', size: '30 ml', price: 260, cat: 'espresso' },
  { no: 'No. 02', name: 'Cortado', img: 'cortado', notes: 'Hazelnut · warm spice · short', size: '90 ml', price: 290, cat: 'espresso' },
  { no: 'No. 04', name: 'Flat White', img: 'flat-white', notes: 'Toffee · cocoa · dense microfoam', size: '150 ml', price: 300, cat: 'espresso' },
  { no: 'No. 07', name: 'Saffron Cortado', img: 'saffron-cortado', notes: 'Rose cardamom · steamed milk', size: '120 ml', price: 340, cat: 'espresso' },
  { no: 'No. 09', name: 'Toffee Cappuccino', img: 'toffee-cappuccino', notes: 'Muscovado · malt · cinnamon dust', size: '180 ml', price: 320, cat: 'milk' },
  { no: 'No. 11', name: 'Vanilla Bean Latte', img: 'vanilla-bean-latte', notes: 'Madagascar vanilla · soft finish', size: '240 ml', price: 330, cat: 'milk' },
  { no: 'No. 12', name: 'Velvet Mocha', img: 'velvet-mocha', notes: 'Single origin cacao · vanilla bean', size: '180 ml', price: 390, cat: 'milk' },
  { no: 'No. 15', name: 'Cold Brew', img: 'cold-brew', notes: 'Stone fruit · cacao · clean sweetness', size: '300 ml', price: 360, cat: 'cold' },
  { no: 'No. 16', name: 'Nitro Cold Brew', img: 'nitro-cold-brew', notes: 'Cascading foam · dry, almost stout', size: '300 ml', price: 400, cat: 'cold' },
  { no: 'No. 17', name: 'Iced Latte', img: 'iced-latte', notes: 'Double shot · cold milk · one big cube', size: '300 ml', price: 330, cat: 'cold' },
  { no: 'No. 18', name: 'Iced Filter', img: 'iced-filter', notes: 'Jasmine · citrus peel · very light', size: '280 ml', price: 310, cat: 'cold' },
  { no: 'No. 27', name: 'Espresso Tonic', img: 'espresso-tonic', notes: 'Tonic · orange peel · long and bitter', size: '240 ml', price: 380, cat: 'cold' },
  { no: 'No. 21', name: 'Masala Chai', img: 'masala-chai', notes: 'Cut on the stove · ginger forward', size: '180 ml', price: 220, cat: 'other' },
  { no: 'No. 24', name: 'Ceremonial Matcha', img: 'ceremonial-matcha', notes: 'Uji first harvest · grassy · sweet', size: '240 ml', price: 340, cat: 'other' },
]

/**
 * The three farms we buy from. The tone drives the orb gradient in the origin
 * section, so a new origin only needs adding here.
 */
export const ORIGINS = [
  {
    id: 'Chikmagalur',
    index: '01',
    place: 'Karnataka, India',
    titleLines: ['Shade-grown', 'under silver oak.'],
    tone: '#8a4b28',
    copy: 'Our house bean, and the reason the espresso tastes like it does. Pulped natural, dried on raised beds, and roasted the week you drink it. Heavy on cocoa, with a caramel finish that holds up to milk.',
    producer: 'Kelagur Estate · Baba Budangiri',
    spec: [
      ['Altitude', '1,150 m'],
      ['Varietal', 'Sln 9 · S795'],
      ['Process', 'Pulped natural'],
      ['Harvest', 'Dec — Feb'],
    ],
    notes: ['Cocoa', 'Burnt caramel', 'Toasted almond'],
    // 0..100. Read as a cupping score would be: relative, not absolute.
    profile: [['Body', 82], ['Acidity', 38], ['Sweetness', 66]],
    becomes: 'The House Espresso',
  },
  {
    id: 'Yirgacheffe',
    index: '02',
    place: 'Gedeo, Ethiopia',
    titleLines: ['Washed, floral,', 'almost like tea.'],
    tone: '#c07a3a',
    copy: 'The lightest thing we roast. Jasmine and citrus peel up front, and a clean sweetness that makes it the pick for filter and iced. We buy a single lot each year and stop when it runs out.',
    producer: 'Worka Chelchele washing station',
    spec: [
      ['Altitude', '2,000 m'],
      ['Varietal', 'Heirloom'],
      ['Process', 'Fully washed'],
      ['Harvest', 'Nov — Jan'],
    ],
    notes: ['Jasmine', 'Citrus peel', 'Bergamot'],
    profile: [['Body', 34], ['Acidity', 88], ['Sweetness', 72]],
    becomes: 'Iced Filter',
  },
  {
    id: 'Antioquia',
    index: '03',
    place: 'Colombia',
    titleLines: ['The one we blend', 'when we want body.'],
    tone: '#6d3b22',
    copy: 'Red fruit and panela sugar, with enough weight to carry a cappuccino. It rounds out the house blend through the monsoon months when the Chikmagalur lot thins out.',
    producer: 'Finca La Ceja · Jardín',
    spec: [
      ['Altitude', '1,700 m'],
      ['Varietal', 'Caturra · Castillo'],
      ['Process', 'Washed'],
      ['Harvest', 'Sep — Dec'],
    ],
    notes: ['Red fruit', 'Panela sugar', 'Cacao nib'],
    profile: [['Body', 70], ['Acidity', 58], ['Sweetness', 80]],
    becomes: 'Velvet Mocha',
  },
]
