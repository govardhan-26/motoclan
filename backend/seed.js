/**
 * seed.js — Moto Clan India
 * Run with: node seed.js
 * Does NOT require the server to be running.
 * Completely resets db.json then inserts demo data.
 */

const { v4: uuidv4 } = require('uuid')
const { readDb, writeDb } = require('./lib/db')
const { hashPassword } = require('./lib/security')

const DEMO_PASSWORD = 'Demo@1234'

function hoursAgo(n) {
  return new Date(Date.now() - n * 3600 * 1000).toISOString()
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 3600 * 1000).toISOString()
}

// ---------------------------------------------------------------------------
// Reset database
// ---------------------------------------------------------------------------

writeDb({
  users: [],
  refresh_tokens: [],
  posts: [],
  post_likes: [],
  comments: [],
  follows: [],
  rides: [],
  ride_participants: [],
  communities: [],
  community_members: [],
  messages: [],
  notifications: []
})
console.log('Database reset.')

const db = readDb()

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const passwordHash = hashPassword(DEMO_PASSWORD)

const rajesh = {
  id: uuidv4(),
  email: 'rajesh@motoclan.in',
  phone_number: '+919876543210',
  password_hash: passwordHash,
  username: 'rajesh_rider',
  full_name: 'Rajesh Kumar',
  bio: 'Born to ride. Royal Enfield loyalist. Mumbai roads and Ladakh dreams.',
  location: 'Mumbai, Maharashtra',
  profile_image_url: null,
  motorcycle_details: 'Royal Enfield Classic 350 2022',
  riding_experience_years: 6,
  created_at: hoursAgo(500)
}

const priya = {
  id: uuidv4(),
  email: 'priya@motoclan.in',
  phone_number: '+919765432101',
  password_hash: passwordHash,
  username: 'priya_throttle',
  full_name: 'Priya Sharma',
  bio: 'Solo rider, coffee lover, Coorg enthusiast. KTM Duke 390 owner.',
  location: 'Bangalore, Karnataka',
  profile_image_url: null,
  motorcycle_details: 'KTM Duke 390 2023',
  riding_experience_years: 3,
  created_at: hoursAgo(480)
}

const vikram = {
  id: uuidv4(),
  email: 'vikram@motoclan.in',
  phone_number: '+919654321012',
  password_hash: passwordHash,
  username: 'vikram_wolf',
  full_name: 'Vikram Singh',
  bio: 'Adventure tourer. Himalayan veteran. 10 years on two wheels across India.',
  location: 'Delhi, NCR',
  profile_image_url: null,
  motorcycle_details: 'Royal Enfield Himalayan 411 2023',
  riding_experience_years: 10,
  created_at: hoursAgo(460)
}

const ananya = {
  id: uuidv4(),
  email: 'ananya@motoclan.in',
  phone_number: '+919543210123',
  password_hash: passwordHash,
  username: 'ananya_rides',
  full_name: 'Ananya Reddy',
  bio: 'Weekend warrior from Hyderabad. Honda CB300R. Discovering hidden India one road at a time.',
  location: 'Hyderabad, Telangana',
  profile_image_url: null,
  motorcycle_details: 'Honda CB300R 2022',
  riding_experience_years: 2,
  created_at: hoursAgo(440)
}

const arjun = {
  id: uuidv4(),
  email: 'arjun@motoclan.in',
  phone_number: '+919432101234',
  password_hash: passwordHash,
  username: 'arjun_moto',
  full_name: 'Arjun Mehta',
  bio: 'Pune-based biker. Dominar 400 rider. Group ride organiser. Chai stops mandatory.',
  location: 'Pune, Maharashtra',
  profile_image_url: null,
  motorcycle_details: 'Bajaj Dominar 400 2023',
  riding_experience_years: 5,
  created_at: hoursAgo(420)
}

db.users.push(rajesh, priya, vikram, ananya, arjun)
console.log('Created 5 users.')

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

const post1 = {
  id: uuidv4(),
  author_id: rajesh.id,
  content: 'Just completed the Pune to Goa coastal highway run on the Classic 350! NH66 is absolutely stunning — coconut groves, backwaters, and the sea breeze the whole way. Took the Murud-Janjira detour and it was totally worth the extra 40 km. Total distance: 620 km in 11 hours. Legs are tired but the soul is full. Who wants to plan a group ride on this route next?',
  media_urls: [],
  created_at: hoursAgo(48)
}

const post2 = {
  id: uuidv4(),
  author_id: priya.id,
  content: 'First solo ride to Coorg done! The misty roads through coffee plantations on the KTM Duke 390 were absolutely magical. Started from Bangalore at 5 AM, hit the ghats by 8, and was sipping fresh filter coffee at a homestay by 10. Girls, if you\'re thinking about solo riding — just go. The roads are yours too.',
  media_urls: [],
  created_at: hoursAgo(47)
}

const post3 = {
  id: uuidv4(),
  author_id: vikram.id,
  content: 'Manali to Leh — day 3 update! Crossed Rohtang Pass at 13,050 ft this morning. The snow walls on either side were 15 feet tall — absolutely humbling on the Himalayan. Road conditions from Gramphu to Keylong are tricky right now, some fresh landslide debris. Acclimatisation is key. Don\'t rush altitude. Camping tonight at Jispa. Stars like you\'ve never seen.',
  media_urls: [],
  created_at: hoursAgo(46)
}

const post4 = {
  id: uuidv4(),
  author_id: ananya.id,
  content: 'Hyderabad to Hampi weekend trip on the CB300R and I\'m obsessed! Left at 4 AM on Saturday, NH44 to Kurnool then cut across to Hospet. The roads through Tungabhadra dam area are gorgeous. Hampi itself is surreal — ancient ruins, giant boulders, the Virupaksha temple in the golden hour. Budget tip: stay at guesthouses near Hampi Bazaar, costs ₹600-800/night.',
  media_urls: [],
  created_at: hoursAgo(45)
}

const post5 = {
  id: uuidv4(),
  author_id: arjun.id,
  content: 'Morning chai stop at a dhaba on NH48 near Khopoli, Maharashtra. There\'s something sacred about this ritual — the smell of cutting chai, truck drivers sharing routes, local news on a fuzzy TV, misty hills in the background. No 5-star breakfast can match this. ₹10 chai, priceless experience. This is what biking in India is really about.',
  media_urls: [],
  created_at: hoursAgo(44)
}

const post6 = {
  id: uuidv4(),
  author_id: rajesh.id,
  content: 'Royal Enfield Owners Meet at Bandra this Sunday, 7 AM sharp at Carter Road! All RE riders welcome — Classic, Meteor, Himalayan, Hunter, Thunderbird, Bullet gang, everyone. We\'ll ride convoy to Alibaug via Mandwa ferry. Slots filling fast — DM me to register. First time? No worries, experienced riders will guide. Let\'s show Mumbai what a proper biking community looks like.',
  media_urls: [],
  created_at: hoursAgo(43)
}

const post7 = {
  id: uuidv4(),
  author_id: vikram.id,
  content: 'Spiti Valley — the roads are finally open for the season! Just got confirmation from locals. Kunzum Pass (15,059 ft) cleared last week. The Kaza circuit is waiting. My itinerary from Shimla: Shimla → Narkanda → Sangla Valley → Kalpa → Nako → Tabo → Kaza → Losar → Kunzum → Manali. 12 days, around 900 km. DM for the detailed route breakdown.',
  media_urls: [],
  created_at: hoursAgo(42)
}

const post8 = {
  id: uuidv4(),
  author_id: priya.id,
  content: 'KTM Duke 390 first service done at 3000 km! KTM service centre on Hosur Road, Bangalore — impressed with the team. They actually explained every step, didn\'t oversell anything. Engine sounds smoother, throttle response feels crisper. Cost: ₹3,200 including oil change and general checkup. For anyone new to the Duke 390 — first service at 1000 km, then every 5000 km. Keep those chains lubed!',
  media_urls: [],
  created_at: hoursAgo(41)
}

const post9 = {
  id: uuidv4(),
  author_id: ananya.id,
  content: 'Caught in the monsoon near Lonavala on the way back from Pune and honestly? Best ride ever. The CB300R handled the wet roads beautifully. Found shelter at a small restaurant, had vada pav and hot bhaji with 6 other bikers all waiting out the rain. Made friends, shared routes, exchanged numbers. This is the Moto Clan spirit.',
  media_urls: [],
  created_at: hoursAgo(40)
}

const post10 = {
  id: uuidv4(),
  author_id: arjun.id,
  content: 'Planning the Ladakh expedition for September and looking for 3-4 riders to join! Route: Pune → Delhi (train with bikes) → Manali → Leh → Pangong Tso → Nubra Valley → Khardung La → back via Srinagar. 18 days total. Budget approx ₹45,000-55,000 per person including fuel, accommodation, permits, and food. Must have min 3 years riding experience. Drop a comment if interested!',
  media_urls: [],
  created_at: hoursAgo(39)
}

db.posts.push(post1, post2, post3, post4, post5, post6, post7, post8, post9, post10)
console.log('Created 10 posts.')

// ---------------------------------------------------------------------------
// Follows — rich social graph so everyone has followers/following
// ---------------------------------------------------------------------------

const follows = [
  // rajesh follows
  { id: uuidv4(), follower_id: rajesh.id, following_id: priya.id,   created_at: hoursAgo(200) },
  { id: uuidv4(), follower_id: rajesh.id, following_id: vikram.id,  created_at: hoursAgo(199) },
  { id: uuidv4(), follower_id: rajesh.id, following_id: arjun.id,   created_at: hoursAgo(198) },
  // priya follows
  { id: uuidv4(), follower_id: priya.id,  following_id: rajesh.id,  created_at: hoursAgo(180) },
  { id: uuidv4(), follower_id: priya.id,  following_id: ananya.id,  created_at: hoursAgo(179) },
  { id: uuidv4(), follower_id: priya.id,  following_id: vikram.id,  created_at: hoursAgo(178) },
  // vikram follows
  { id: uuidv4(), follower_id: vikram.id, following_id: rajesh.id,  created_at: hoursAgo(160) },
  { id: uuidv4(), follower_id: vikram.id, following_id: arjun.id,   created_at: hoursAgo(159) },
  { id: uuidv4(), follower_id: vikram.id, following_id: ananya.id,  created_at: hoursAgo(158) },
  // ananya follows
  { id: uuidv4(), follower_id: ananya.id, following_id: priya.id,   created_at: hoursAgo(140) },
  { id: uuidv4(), follower_id: ananya.id, following_id: vikram.id,  created_at: hoursAgo(139) },
  { id: uuidv4(), follower_id: ananya.id, following_id: arjun.id,   created_at: hoursAgo(138) },
  // arjun follows
  { id: uuidv4(), follower_id: arjun.id,  following_id: rajesh.id,  created_at: hoursAgo(120) },
  { id: uuidv4(), follower_id: arjun.id,  following_id: vikram.id,  created_at: hoursAgo(119) },
  { id: uuidv4(), follower_id: arjun.id,  following_id: priya.id,   created_at: hoursAgo(118) },
]
db.follows.push(...follows)
console.log(`Created ${follows.length} follows.`)

// ---------------------------------------------------------------------------
// Likes — each post liked by multiple users so likes show cross-profile
// ---------------------------------------------------------------------------

const likes = [
  // post1 (rajesh's Goa ride) liked by priya, vikram, ananya, arjun
  { id: uuidv4(), post_id: post1.id, user_id: priya.id,   created_at: hoursAgo(47) },
  { id: uuidv4(), post_id: post1.id, user_id: vikram.id,  created_at: hoursAgo(46) },
  { id: uuidv4(), post_id: post1.id, user_id: ananya.id,  created_at: hoursAgo(46) },
  { id: uuidv4(), post_id: post1.id, user_id: arjun.id,   created_at: hoursAgo(45) },
  // post2 (priya's Coorg solo) liked by rajesh, vikram, ananya
  { id: uuidv4(), post_id: post2.id, user_id: rajesh.id,  created_at: hoursAgo(46) },
  { id: uuidv4(), post_id: post2.id, user_id: vikram.id,  created_at: hoursAgo(45) },
  { id: uuidv4(), post_id: post2.id, user_id: ananya.id,  created_at: hoursAgo(44) },
  // post3 (vikram's Leh day 3) liked by rajesh, priya, arjun
  { id: uuidv4(), post_id: post3.id, user_id: rajesh.id,  created_at: hoursAgo(45) },
  { id: uuidv4(), post_id: post3.id, user_id: priya.id,   created_at: hoursAgo(44) },
  { id: uuidv4(), post_id: post3.id, user_id: arjun.id,   created_at: hoursAgo(43) },
  // post4 (ananya's Hampi) liked by priya, vikram, arjun
  { id: uuidv4(), post_id: post4.id, user_id: priya.id,   created_at: hoursAgo(44) },
  { id: uuidv4(), post_id: post4.id, user_id: vikram.id,  created_at: hoursAgo(43) },
  { id: uuidv4(), post_id: post4.id, user_id: arjun.id,   created_at: hoursAgo(42) },
  // post5 (arjun's dhaba chai) liked by rajesh, vikram, priya, ananya
  { id: uuidv4(), post_id: post5.id, user_id: rajesh.id,  created_at: hoursAgo(43) },
  { id: uuidv4(), post_id: post5.id, user_id: vikram.id,  created_at: hoursAgo(42) },
  { id: uuidv4(), post_id: post5.id, user_id: priya.id,   created_at: hoursAgo(42) },
  { id: uuidv4(), post_id: post5.id, user_id: ananya.id,  created_at: hoursAgo(41) },
  // post6 (rajesh's RE meet) liked by priya, arjun, ananya
  { id: uuidv4(), post_id: post6.id, user_id: priya.id,   created_at: hoursAgo(42) },
  { id: uuidv4(), post_id: post6.id, user_id: arjun.id,   created_at: hoursAgo(41) },
  { id: uuidv4(), post_id: post6.id, user_id: ananya.id,  created_at: hoursAgo(40) },
  // post7 (vikram's Spiti open) liked by rajesh, priya, ananya, arjun
  { id: uuidv4(), post_id: post7.id, user_id: rajesh.id,  created_at: hoursAgo(41) },
  { id: uuidv4(), post_id: post7.id, user_id: priya.id,   created_at: hoursAgo(40) },
  { id: uuidv4(), post_id: post7.id, user_id: ananya.id,  created_at: hoursAgo(40) },
  { id: uuidv4(), post_id: post7.id, user_id: arjun.id,   created_at: hoursAgo(39) },
  // post8 (priya's service tip) liked by rajesh, ananya
  { id: uuidv4(), post_id: post8.id, user_id: rajesh.id,  created_at: hoursAgo(40) },
  { id: uuidv4(), post_id: post8.id, user_id: ananya.id,  created_at: hoursAgo(39) },
  // post9 (ananya's monsoon ride) liked by priya, vikram
  { id: uuidv4(), post_id: post9.id, user_id: priya.id,   created_at: hoursAgo(39) },
  { id: uuidv4(), post_id: post9.id, user_id: vikram.id,  created_at: hoursAgo(38) },
  // post10 (arjun's Ladakh call) liked by rajesh, vikram, priya, ananya
  { id: uuidv4(), post_id: post10.id, user_id: rajesh.id,  created_at: hoursAgo(38) },
  { id: uuidv4(), post_id: post10.id, user_id: vikram.id,  created_at: hoursAgo(37) },
  { id: uuidv4(), post_id: post10.id, user_id: priya.id,   created_at: hoursAgo(37) },
  { id: uuidv4(), post_id: post10.id, user_id: ananya.id,  created_at: hoursAgo(36) },
]
db.post_likes.push(...likes)
console.log(`Created ${likes.length} likes.`)

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

const comments = [
  // Comments on post1 (rajesh's Goa ride)
  { id: uuidv4(), post_id: post1.id, author_id: vikram.id,  content: 'NH66 is incredible! Rode it in 2022 during monsoon — the rivers were overflowing onto the road, absolutely wild. Next time take the old NH17 through Ratnagiri, even more scenic.',  created_at: hoursAgo(47) },
  { id: uuidv4(), post_id: post1.id, author_id: arjun.id,   content: 'Bhai count me in for the group ride! Have been wanting to do this route for ages. The Murud-Janjira fort is also worth visiting while you\'re near there.',                         created_at: hoursAgo(46) },
  { id: uuidv4(), post_id: post1.id, author_id: priya.id,   content: 'Jealous! I did NH66 earlier this year on the Duke — gear down for the ghats near Goa border. Amazing road though. Your Classic 350 must have sounded perfect on that coastal stretch.', created_at: hoursAgo(45) },

  // Comments on post2 (priya's Coorg solo)
  { id: uuidv4(), post_id: post2.id, author_id: ananya.id,  content: 'This is so inspiring! I\'ve been nervous about solo riding. What gear setup do you use for long solo trips?',                                                                            created_at: hoursAgo(46) },
  { id: uuidv4(), post_id: post2.id, author_id: rajesh.id,  content: 'The B-M road is butter smooth now since they repaved it. Coorg in the monsoon is magical but July-August gets very heavy rainfall. Any particular homestay you\'d recommend?',            created_at: hoursAgo(45) },

  // Comments on post3 (vikram's Leh update)
  { id: uuidv4(), post_id: post3.id, author_id: rajesh.id,  content: 'Bhai stay safe! Those landslide areas can be really unpredictable. What time did you cross Rohtang? Heard the morning window is best before the tourist traffic builds up.',              created_at: hoursAgo(45) },
  { id: uuidv4(), post_id: post3.id, author_id: arjun.id,   content: 'Following your updates closely — planning Leh for next year. How is the fuel situation from Keylong onwards? Is the Patseo pump reliable?',                                              created_at: hoursAgo(44) },

  // Comments on post4 (ananya's Hampi)
  { id: uuidv4(), post_id: post4.id, author_id: priya.id,   content: 'Hampi is on my list! The Vijayanagara empire ruins are breathtaking. Did you take the coracle (round boat) across the river to Virupapur Gadde? It\'s a different world on that side.', created_at: hoursAgo(44) },
  { id: uuidv4(), post_id: post4.id, author_id: vikram.id,  content: 'Good budget tip! I\'d also add — hire a bicycle in Hampi itself to explore the ruins without worrying about parking the bike. Roads between monuments are narrow.',                        created_at: hoursAgo(43) },

  // Comments on post5 (arjun's dhaba chai)
  { id: uuidv4(), post_id: post5.id, author_id: rajesh.id,  content: 'The Khopoli dhaba belt is legendary! On the way back from Lonavala, the one with the green boards near the toll — best misal pav in Maharashtra. This post made me hungry.',            created_at: hoursAgo(43) },
  { id: uuidv4(), post_id: post5.id, author_id: priya.id,   content: '100% this. My favourite is the chai stop near Tumkur on NH48 heading towards Bangalore. The chai wala remembers all the regulars — that level of warmth you can\'t buy anywhere.',      created_at: hoursAgo(42) },

  // Comments on post7 (vikram's Spiti open)
  { id: uuidv4(), post_id: post7.id, author_id: rajesh.id,  content: 'Vikram bhai sending this straight to family group chat. My Spiti dream is this year! The Sangla valley detour — worth it or skip for time?',                                            created_at: hoursAgo(41) },
  { id: uuidv4(), post_id: post7.id, author_id: priya.id,   content: 'Do NOT skip Sangla Valley. Chitkul village at the end of the road is the last inhabited village before the Indo-China border. Worth every km.',                                          created_at: hoursAgo(40) },

  // Comments on post10 (arjun's Ladakh expedition call)
  { id: uuidv4(), post_id: post10.id, author_id: vikram.id, content: 'Train with bikes is the right call — DLI-MMCT Rajdhani takes bikes. Book 2 months ahead, the auto wagon books up fast in July-September. I can guide the Manali-Leh section if you need.',  created_at: hoursAgo(38) },
  { id: uuidv4(), post_id: post10.id, author_id: rajesh.id, content: 'I\'m very interested! September timing is perfect — post monsoon, roads clear, less snow risk. What\'s the minimum experience you\'re looking for?',                                        created_at: hoursAgo(37) },
  { id: uuidv4(), post_id: post10.id, author_id: priya.id,  content: 'Interested! I have 3+ years. Can women join? (asking because some groups prefer male-only, I know it\'s odd but want to confirm)',                                                          created_at: hoursAgo(36) },
]
db.comments.push(...comments)
console.log(`Created ${comments.length} comments.`)

// ---------------------------------------------------------------------------
// Rides
// ---------------------------------------------------------------------------

const ride1 = {
  id: uuidv4(),
  organizer_id: vikram.id,
  title: 'Manali to Leh Expedition',
  description: 'The ultimate Himalayan adventure! We ride from Manali through Rohtang Pass, Baralacha La, Lachulung La, and Tanglang La all the way to Leh. Covering some of the highest motorable roads in the world. Experience required — minimum 5 years riding experience and adventure touring setup recommended.',
  start_location: 'Manali, Himachal Pradesh',
  destination: 'Leh, Ladakh',
  ride_date: daysFromNow(15),
  max_participants: 10,
  status: 'upcoming',
  created_at: hoursAgo(72)
}

const ride2 = {
  id: uuidv4(),
  organizer_id: arjun.id,
  title: 'Western Ghats Weekend Ride',
  description: 'A beautiful weekend escape through the misty Western Ghats. Pune to Mahabaleshwar via Panchgani. Expect stunning valley views, strawberry farms, and the famous Mapro Garden stop. All experience levels welcome. We\'ll ride in convoy with safety marshals.',
  start_location: 'Pune, Maharashtra',
  destination: 'Mahabaleshwar, Maharashtra',
  ride_date: daysFromNow(7),
  max_participants: 15,
  status: 'upcoming',
  created_at: hoursAgo(60)
}

const ride3 = {
  id: uuidv4(),
  organizer_id: vikram.id,
  title: 'Spiti Valley Adventure',
  description: 'Experience one of the most remote and breathtaking valleys in India. Starting from Shimla, we traverse through Kinnaur, Sangla Valley, and into the cold desert landscape of Spiti. 12 days of pure riding bliss. Altitude goes up to 15,000 ft. AMS awareness essential.',
  start_location: 'Shimla, Himachal Pradesh',
  destination: 'Kaza, Spiti Valley',
  ride_date: daysFromNow(30),
  max_participants: 8,
  status: 'upcoming',
  created_at: hoursAgo(48)
}

const ride4 = {
  id: uuidv4(),
  organizer_id: priya.id,
  title: 'Coorg Coffee Trail',
  description: 'A perfect weekend ride for coffee lovers and nature enthusiasts! From Bangalore through Mysore to the lush coffee plantations of Coorg. We\'ll visit Namdroling Monastery (Golden Temple), Abbey Falls, and Dubare Elephant Camp. All experience levels welcome.',
  start_location: 'Bangalore, Karnataka',
  destination: 'Coorg, Karnataka',
  ride_date: daysFromNow(5),
  max_participants: 12,
  status: 'upcoming',
  created_at: hoursAgo(36)
}

db.rides.push(ride1, ride2, ride3, ride4)
console.log('Created 4 rides.')

db.ride_participants.push(
  { id: uuidv4(), ride_id: ride1.id, user_id: vikram.id,  joined_at: hoursAgo(72) },
  { id: uuidv4(), ride_id: ride1.id, user_id: rajesh.id,  joined_at: hoursAgo(50) },
  { id: uuidv4(), ride_id: ride1.id, user_id: arjun.id,   joined_at: hoursAgo(30) },

  { id: uuidv4(), ride_id: ride2.id, user_id: arjun.id,   joined_at: hoursAgo(60) },
  { id: uuidv4(), ride_id: ride2.id, user_id: rajesh.id,  joined_at: hoursAgo(40) },
  { id: uuidv4(), ride_id: ride2.id, user_id: priya.id,   joined_at: hoursAgo(35) },

  { id: uuidv4(), ride_id: ride3.id, user_id: vikram.id,  joined_at: hoursAgo(48) },
  { id: uuidv4(), ride_id: ride3.id, user_id: rajesh.id,  joined_at: hoursAgo(25) },

  { id: uuidv4(), ride_id: ride4.id, user_id: priya.id,   joined_at: hoursAgo(36) },
  { id: uuidv4(), ride_id: ride4.id, user_id: ananya.id,  joined_at: hoursAgo(20) },
  { id: uuidv4(), ride_id: ride4.id, user_id: arjun.id,   joined_at: hoursAgo(15) }
)
console.log('Created ride participants.')

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

const comm1 = {
  id: uuidv4(),
  creator_id: rajesh.id,
  name: 'Royal Enfield India',
  description: 'The ultimate community for Royal Enfield enthusiasts across India. Share your rides, tips, modifications, and connect with fellow Enfielders. From Bullet to Himalayan, all RE riders welcome here!',
  cover_image_url: null,
  category: 'Brand Club',
  created_at: hoursAgo(300)
}

const comm2 = {
  id: uuidv4(),
  creator_id: vikram.id,
  name: 'Ladakh Riders',
  description: 'For those who\'ve felt the call of the mountains. A community dedicated to Ladakh touring — route planning, permits, acclimatisation tips, gear advice, and connecting with riders heading to the land of high passes.',
  cover_image_url: null,
  category: 'Adventure',
  created_at: hoursAgo(280)
}

const comm3 = {
  id: uuidv4(),
  creator_id: arjun.id,
  name: 'Maharashtra Bikers',
  description: 'All bikers from Maharashtra! Whether you\'re riding the Konkan coast, the Western Ghats, or exploring Vidarbha and Marathwada, this is your community. Weekly rides, monthly meetups, and the best dhaba recommendations in the state.',
  cover_image_url: null,
  category: 'Regional',
  created_at: hoursAgo(260)
}

db.communities.push(comm1, comm2, comm3)
console.log('Created 3 communities.')

db.community_members.push(
  { id: uuidv4(), community_id: comm1.id, user_id: rajesh.id, joined_at: hoursAgo(300) },
  { id: uuidv4(), community_id: comm1.id, user_id: vikram.id, joined_at: hoursAgo(290) },
  { id: uuidv4(), community_id: comm1.id, user_id: arjun.id,  joined_at: hoursAgo(285) },
  { id: uuidv4(), community_id: comm1.id, user_id: priya.id,  joined_at: hoursAgo(280) },

  { id: uuidv4(), community_id: comm2.id, user_id: vikram.id, joined_at: hoursAgo(280) },
  { id: uuidv4(), community_id: comm2.id, user_id: rajesh.id, joined_at: hoursAgo(270) },
  { id: uuidv4(), community_id: comm2.id, user_id: arjun.id,  joined_at: hoursAgo(265) },
  { id: uuidv4(), community_id: comm2.id, user_id: ananya.id, joined_at: hoursAgo(260) },

  { id: uuidv4(), community_id: comm3.id, user_id: arjun.id,  joined_at: hoursAgo(260) },
  { id: uuidv4(), community_id: comm3.id, user_id: rajesh.id, joined_at: hoursAgo(255) },
  { id: uuidv4(), community_id: comm3.id, user_id: priya.id,  joined_at: hoursAgo(250) },
  { id: uuidv4(), community_id: comm3.id, user_id: vikram.id, joined_at: hoursAgo(245) }
)
console.log('Created community members.')

// ---------------------------------------------------------------------------
// Messages — multiple real conversations between users
// ---------------------------------------------------------------------------

db.messages.push(
  // Vikram ↔ Rajesh: planning Leh ride
  { id: uuidv4(), sender_id: vikram.id,  recipient_id: rajesh.id, content: 'Bhai, are you joining the Manali-Leh ride? Need to confirm participant count for the permit.',                          is_read: true,  created_at: hoursAgo(52) },
  { id: uuidv4(), sender_id: rajesh.id,  recipient_id: vikram.id, content: 'Yes! 100% in. Classic 350 or should I borrow a Himalayan for this one?',                                               is_read: true,  created_at: hoursAgo(51) },
  { id: uuidv4(), sender_id: vikram.id,  recipient_id: rajesh.id, content: 'For Leh? Himalayan bhai. Classic will struggle above 12,000 ft. Borrow it if you can.',                                is_read: true,  created_at: hoursAgo(50) },
  { id: uuidv4(), sender_id: rajesh.id,  recipient_id: vikram.id, content: 'Sorted! Will get my RE dealer friend\'s Himalayan. See you in Manali!',                                                 is_read: false, created_at: hoursAgo(49) },

  // Priya ↔ Ananya: planning Chikmagalur ride
  { id: uuidv4(), sender_id: priya.id,   recipient_id: ananya.id, content: 'Hey! Saw your Hampi post — loved it! I\'m planning a solo ride to Chikmagalur next month, want to join?',              is_read: true,  created_at: hoursAgo(30) },
  { id: uuidv4(), sender_id: ananya.id,  recipient_id: priya.id,  content: 'Definitely! Chikmagalur coffee estates + hills = perfect! Let\'s plan it. What dates are you thinking?',                is_read: true,  created_at: hoursAgo(28) },
  { id: uuidv4(), sender_id: priya.id,   recipient_id: ananya.id, content: 'I\'m thinking last weekend of next month — Friday evening start, back Sunday night. You okay with ~600 km round trip?', is_read: true,  created_at: hoursAgo(27) },
  { id: uuidv4(), sender_id: ananya.id,  recipient_id: priya.id,  content: 'Perfect! CB300R can do that easily. Let\'s lock dates and I\'ll book accommodation in advance.',                         is_read: false, created_at: hoursAgo(26) },

  // Arjun ↔ Rajesh: Western Ghats ride coordination
  { id: uuidv4(), sender_id: arjun.id,   recipient_id: rajesh.id, content: 'Rajesh! Are you coming to the Western Ghats ride? Need one more experienced rider to be a marshal.',                    is_read: true,  created_at: hoursAgo(38) },
  { id: uuidv4(), sender_id: rajesh.id,  recipient_id: arjun.id,  content: 'Arjun bhai I\'m in! Mumbai to Pune the night before and we start early. Happy to be a marshal.',                        is_read: true,  created_at: hoursAgo(37) },
  { id: uuidv4(), sender_id: arjun.id,   recipient_id: rajesh.id, content: 'Perfect. Meet point at Chandni Chowk, Pune at 6 AM. I\'ll share the WhatsApp group link.',                             is_read: false, created_at: hoursAgo(36) },

  // Vikram ↔ Arjun: Ladakh expedition discussion
  { id: uuidv4(), sender_id: arjun.id,   recipient_id: vikram.id, content: 'Vikram bhai, saw your Spiti post. Incredible! I\'m organising a Ladakh trip for September — would you join as guide?',  is_read: true,  created_at: hoursAgo(20) },
  { id: uuidv4(), sender_id: vikram.id,  recipient_id: arjun.id,  content: 'September is tough for me — I\'ll be in Spiti till mid-Sept. But I can help plan the route and give you all my contacts in Leh.',  is_read: true,  created_at: hoursAgo(18) },
  { id: uuidv4(), sender_id: arjun.id,   recipient_id: vikram.id, content: 'That would be amazing! Can I call you this weekend? Would love your Leh contacts especially near Pangong.',              is_read: false, created_at: hoursAgo(16) }
)
console.log('Created messages.')

// ---------------------------------------------------------------------------
// Notifications — for ALL 5 users
// ---------------------------------------------------------------------------

db.notifications.push(
  // Rajesh's notifications
  { id: uuidv4(), user_id: rajesh.id, actor_id: priya.id,   type: 'like',        content: 'Priya Sharma liked your post',                             link: `/posts/${post1.id}`,  is_read: false, created_at: hoursAgo(47) },
  { id: uuidv4(), user_id: rajesh.id, actor_id: vikram.id,  type: 'like',        content: 'Vikram Singh liked your post',                             link: `/posts/${post1.id}`,  is_read: false, created_at: hoursAgo(46) },
  { id: uuidv4(), user_id: rajesh.id, actor_id: vikram.id,  type: 'comment',     content: 'Vikram Singh commented on your post',                      link: `/posts/${post1.id}`,  is_read: false, created_at: hoursAgo(47) },
  { id: uuidv4(), user_id: rajesh.id, actor_id: arjun.id,   type: 'comment',     content: 'Arjun Mehta commented on your post',                       link: `/posts/${post1.id}`,  is_read: true,  created_at: hoursAgo(46) },
  { id: uuidv4(), user_id: rajesh.id, actor_id: priya.id,   type: 'follow',      content: 'Priya Sharma started following you',                       link: `/profile/priya_throttle`, is_read: true, created_at: hoursAgo(180) },
  { id: uuidv4(), user_id: rajesh.id, actor_id: vikram.id,  type: 'follow',      content: 'Vikram Singh started following you',                       link: `/profile/vikram_wolf`,    is_read: true, created_at: hoursAgo(160) },
  { id: uuidv4(), user_id: rajesh.id, actor_id: arjun.id,   type: 'follow',      content: 'Arjun Mehta started following you',                        link: `/profile/arjun_moto`,     is_read: true, created_at: hoursAgo(120) },

  // Priya's notifications
  { id: uuidv4(), user_id: priya.id,  actor_id: rajesh.id,  type: 'like',        content: 'Rajesh Kumar liked your post',                             link: `/posts/${post2.id}`,  is_read: false, created_at: hoursAgo(46) },
  { id: uuidv4(), user_id: priya.id,  actor_id: ananya.id,  type: 'like',        content: 'Ananya Reddy liked your post',                             link: `/posts/${post2.id}`,  is_read: false, created_at: hoursAgo(44) },
  { id: uuidv4(), user_id: priya.id,  actor_id: ananya.id,  type: 'comment',     content: 'Ananya Reddy commented on your post',                      link: `/posts/${post2.id}`,  is_read: false, created_at: hoursAgo(46) },
  { id: uuidv4(), user_id: priya.id,  actor_id: ananya.id,  type: 'follow',      content: 'Ananya Reddy started following you',                       link: `/profile/ananya_rides`,   is_read: true,  created_at: hoursAgo(140) },
  { id: uuidv4(), user_id: priya.id,  actor_id: arjun.id,   type: 'follow',      content: 'Arjun Mehta started following you',                        link: `/profile/arjun_moto`,     is_read: true,  created_at: hoursAgo(118) },
  { id: uuidv4(), user_id: priya.id,  actor_id: ananya.id,  type: 'ride_invite', content: 'Ananya Reddy joined your ride: Coorg Coffee Trail',         link: `/rides/${ride4.id}`,  is_read: false, created_at: hoursAgo(20) },

  // Vikram's notifications
  { id: uuidv4(), user_id: vikram.id, actor_id: rajesh.id,  type: 'like',        content: 'Rajesh Kumar liked your post',                             link: `/posts/${post3.id}`,  is_read: false, created_at: hoursAgo(45) },
  { id: uuidv4(), user_id: vikram.id, actor_id: priya.id,   type: 'like',        content: 'Priya Sharma liked your post',                             link: `/posts/${post7.id}`,  is_read: false, created_at: hoursAgo(40) },
  { id: uuidv4(), user_id: vikram.id, actor_id: rajesh.id,  type: 'comment',     content: 'Rajesh Kumar commented on your post',                      link: `/posts/${post3.id}`,  is_read: false, created_at: hoursAgo(45) },
  { id: uuidv4(), user_id: vikram.id, actor_id: rajesh.id,  type: 'ride_invite', content: 'Rajesh Kumar joined your ride: Manali to Leh Expedition',   link: `/rides/${ride1.id}`,  is_read: true,  created_at: hoursAgo(50) },
  { id: uuidv4(), user_id: vikram.id, actor_id: arjun.id,   type: 'ride_invite', content: 'Arjun Mehta joined your ride: Manali to Leh Expedition',    link: `/rides/${ride1.id}`,  is_read: false, created_at: hoursAgo(30) },
  { id: uuidv4(), user_id: vikram.id, actor_id: priya.id,   type: 'follow',      content: 'Priya Sharma started following you',                       link: `/profile/priya_throttle`, is_read: true, created_at: hoursAgo(178) },

  // Ananya's notifications
  { id: uuidv4(), user_id: ananya.id, actor_id: priya.id,   type: 'like',        content: 'Priya Sharma liked your post',                             link: `/posts/${post4.id}`,  is_read: false, created_at: hoursAgo(44) },
  { id: uuidv4(), user_id: ananya.id, actor_id: vikram.id,  type: 'like',        content: 'Vikram Singh liked your post',                             link: `/posts/${post4.id}`,  is_read: false, created_at: hoursAgo(43) },
  { id: uuidv4(), user_id: ananya.id, actor_id: priya.id,   type: 'comment',     content: 'Priya Sharma commented on your post',                      link: `/posts/${post4.id}`,  is_read: false, created_at: hoursAgo(44) },
  { id: uuidv4(), user_id: ananya.id, actor_id: vikram.id,  type: 'comment',     content: 'Vikram Singh commented on your post',                      link: `/posts/${post4.id}`,  is_read: true,  created_at: hoursAgo(43) },
  { id: uuidv4(), user_id: ananya.id, actor_id: priya.id,   type: 'follow',      content: 'Priya Sharma started following you',                       link: `/profile/priya_throttle`, is_read: true, created_at: hoursAgo(179) },

  // Arjun's notifications
  { id: uuidv4(), user_id: arjun.id,  actor_id: rajesh.id,  type: 'like',        content: 'Rajesh Kumar liked your post',                             link: `/posts/${post5.id}`,  is_read: false, created_at: hoursAgo(43) },
  { id: uuidv4(), user_id: arjun.id,  actor_id: vikram.id,  type: 'like',        content: 'Vikram Singh liked your post',                             link: `/posts/${post5.id}`,  is_read: false, created_at: hoursAgo(42) },
  { id: uuidv4(), user_id: arjun.id,  actor_id: rajesh.id,  type: 'comment',     content: 'Rajesh Kumar commented on your post',                      link: `/posts/${post5.id}`,  is_read: false, created_at: hoursAgo(43) },
  { id: uuidv4(), user_id: arjun.id,  actor_id: vikram.id,  type: 'comment',     content: 'Vikram Singh commented on your post: Ladakh Expedition',    link: `/posts/${post10.id}`, is_read: false, created_at: hoursAgo(38) },
  { id: uuidv4(), user_id: arjun.id,  actor_id: priya.id,   type: 'ride_invite', content: 'Priya Sharma joined your ride: Western Ghats Weekend Ride', link: `/rides/${ride2.id}`,  is_read: true,  created_at: hoursAgo(35) },
  { id: uuidv4(), user_id: arjun.id,  actor_id: rajesh.id,  type: 'follow',      content: 'Rajesh Kumar started following you',                       link: `/profile/rajesh_rider`,   is_read: true, created_at: hoursAgo(198) },
)
console.log('Created notifications.')

// ---------------------------------------------------------------------------
// Write final db
// ---------------------------------------------------------------------------

writeDb(db)

console.log('\n=== Seed complete! ===')
console.log('\nTest accounts (password for all: Demo@1234):')
console.log('  Email                  | Username        | Name')
console.log('  ---------------------- | --------------- | ---------------')
console.log('  rajesh@motoclan.in     | rajesh_rider    | Rajesh Kumar')
console.log('  priya@motoclan.in      | priya_throttle  | Priya Sharma')
console.log('  vikram@motoclan.in     | vikram_wolf     | Vikram Singh')
console.log('  ananya@motoclan.in     | ananya_rides    | Ananya Reddy')
console.log('  arjun@motoclan.in      | arjun_moto      | Arjun Mehta')
console.log('\nStart the server: npm run dev')
