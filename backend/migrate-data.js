/**
 * Migrate existing db.json data to PostgreSQL via Prisma.
 * Run ONCE on the target machine after setting up the database:
 *   node migrate-data.js
 */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const prisma = require('./lib/prisma')

const DB_PATH = path.join(__dirname, 'db.json')

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('No db.json found — nothing to migrate.')
    return
  }

  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  console.log('Starting migration from db.json...\n')

  // ── 1. Users ────────────────────────────────────────────────────────────────
  console.log(`Migrating ${db.users?.length ?? 0} users...`)
  for (const u of db.users ?? []) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        phone_number: u.phone_number || null,
        password_hash: u.password_hash,
        username: u.username,
        full_name: u.full_name,
        bio: u.bio || null,
        location: u.location || null,
        profile_image_url: u.profile_image_url || null,
        motorcycle_details: u.motorcycle_details || null,
        riding_experience_years: u.riding_experience_years || null,
        created_at: u.created_at ? new Date(u.created_at) : new Date(),
      }
    })
  }
  console.log('  ✓ Users done')

  // ── 2. Refresh tokens ───────────────────────────────────────────────────────
  console.log(`Migrating ${db.refresh_tokens?.length ?? 0} refresh tokens...`)
  for (const t of db.refresh_tokens ?? []) {
    await prisma.refreshToken.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        token: t.token,
        user_id: t.user_id,
        created_at: t.created_at ? new Date(t.created_at) : new Date(),
      }
    }).catch(() => {}) // skip if user missing
  }
  console.log('  ✓ Refresh tokens done')

  // ── 3. Follows ──────────────────────────────────────────────────────────────
  console.log(`Migrating ${db.follows?.length ?? 0} follows...`)
  for (const f of db.follows ?? []) {
    await prisma.follow.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        follower_id: f.follower_id,
        following_id: f.following_id,
        created_at: f.created_at ? new Date(f.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Follows done')

  // ── 4. Posts ────────────────────────────────────────────────────────────────
  console.log(`Migrating ${db.posts?.length ?? 0} posts...`)
  for (const p of db.posts ?? []) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        author_id: p.author_id,
        content: p.content,
        media_urls: p.media_urls || [],
        created_at: p.created_at ? new Date(p.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Posts done')

  // ── 5. Post likes ───────────────────────────────────────────────────────────
  console.log(`Migrating ${db.post_likes?.length ?? 0} post likes...`)
  for (const l of db.post_likes ?? []) {
    await prisma.postLike.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        post_id: l.post_id,
        user_id: l.user_id,
        created_at: l.created_at ? new Date(l.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Post likes done')

  // ── 6. Comments ─────────────────────────────────────────────────────────────
  console.log(`Migrating ${db.comments?.length ?? 0} comments...`)
  for (const c of db.comments ?? []) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        post_id: c.post_id,
        author_id: c.author_id,
        content: c.content,
        created_at: c.created_at ? new Date(c.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Comments done')

  // ── 7. Communities ──────────────────────────────────────────────────────────
  console.log(`Migrating ${db.communities?.length ?? 0} communities...`)
  for (const c of db.communities ?? []) {
    await prisma.community.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        creator_id: c.creator_id || null,
        name: c.name,
        description: c.description,
        cover_image_url: c.cover_image_url || null,
        category: c.category || null,
        created_at: c.created_at ? new Date(c.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Communities done')

  // ── 8. Community members ────────────────────────────────────────────────────
  console.log(`Migrating ${db.community_members?.length ?? 0} community members...`)
  for (const m of db.community_members ?? []) {
    await prisma.communityMember.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        community_id: m.community_id,
        user_id: m.user_id,
        joined_at: m.joined_at ? new Date(m.joined_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Community members done')

  // ── 9. Rides ────────────────────────────────────────────────────────────────
  console.log(`Migrating ${db.rides?.length ?? 0} rides...`)
  for (const r of db.rides ?? []) {
    await prisma.ride.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        organizer_id: r.organizer_id,
        title: r.title,
        description: r.description || '',
        start_location: r.start_location,
        destination: r.destination,
        ride_date: r.ride_date,
        max_participants: r.max_participants,
        status: r.status || 'upcoming',
        created_at: r.created_at ? new Date(r.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Rides done')

  // ── 10. Ride participants ───────────────────────────────────────────────────
  console.log(`Migrating ${db.ride_participants?.length ?? 0} ride participants...`)
  for (const p of db.ride_participants ?? []) {
    await prisma.rideParticipant.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        ride_id: p.ride_id,
        user_id: p.user_id,
        joined_at: p.joined_at ? new Date(p.joined_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Ride participants done')

  // ── 11. Ride join requests ──────────────────────────────────────────────────
  console.log(`Migrating ${db.ride_join_requests?.length ?? 0} ride join requests...`)
  for (const r of db.ride_join_requests ?? []) {
    await prisma.rideJoinRequest.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        ride_id: r.ride_id,
        user_id: r.user_id,
        status: r.status || 'pending',
        created_at: r.created_at ? new Date(r.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Ride join requests done')

  // ── 12. Messages ────────────────────────────────────────────────────────────
  console.log(`Migrating ${db.messages?.length ?? 0} messages...`)
  for (const m of db.messages ?? []) {
    await prisma.message.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        sender_id: m.sender_id,
        recipient_id: m.recipient_id,
        content: m.content,
        is_read: m.is_read ?? false,
        created_at: m.created_at ? new Date(m.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Messages done')

  // ── 13. Notifications ───────────────────────────────────────────────────────
  console.log(`Migrating ${db.notifications?.length ?? 0} notifications...`)
  for (const n of db.notifications ?? []) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        user_id: n.user_id,
        actor_id: n.actor_id || null,
        type: n.type,
        content: n.content,
        link: n.link || null,
        is_read: n.is_read ?? false,
        created_at: n.created_at ? new Date(n.created_at) : new Date(),
      }
    }).catch(() => {})
  }
  console.log('  ✓ Notifications done')

  console.log('\n✅ Migration complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
