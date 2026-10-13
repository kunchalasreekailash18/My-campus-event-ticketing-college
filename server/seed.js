const { initDB, all, run, saveDB } = require('./db');

async function seed() {
  await initDB();

  console.log('Resetting and seeding N.B.K.R.I.S.T campus platform data with authentication & coordinators...');

  // Clear existing tables for a clean slate
  run('DELETE FROM tickets');
  run('DELETE FROM ticket_tiers');
  run('DELETE FROM events');
  run('DELETE FROM post_reactions');
  run('DELETE FROM post_comments');
  run('DELETE FROM openmind_posts');
  run('DELETE FROM users');
  run('DELETE FROM coordinators');

  // 1. Seed Coordinators (As specified by user)
  // Coordinator 1: Roll No 24KB1A05W1, Password KAILASH@123
  // Coordinator 2: Roll No 24KB1A0597, Password 9032416879
  run(
    `INSERT INTO coordinators (roll_no, password, name, branch, role)
     VALUES (?, ?, ?, ?, ?)`,
    ['24KB1A05W1', 'KAILASH@123', 'Kailash (Lead Coordinator)', 'CSE', 'coordinator']
  );

  run(
    `INSERT INTO coordinators (roll_no, password, name, branch, role)
     VALUES (?, ?, ?, ?, ?)`,
    ['24KB1A0597', '9032416879', 'Student Coordinator 24KB1A0597', 'CSE', 'coordinator']
  );

  // 2. Seed Default Student Accounts for immediate testing
  run(
    `INSERT INTO users (name, branch, college_email, phone_no, year_of_study, password, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['V. Sai Charan', 'CSE', 'saicharan.cse@nbkrist.edu.in', '9876543210', '3rd Year', 'nbkr@123', 'student']
  );

  run(
    `INSERT INTO users (name, branch, college_email, phone_no, year_of_study, password, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['M. Akhil', 'MECH', 'akhil.mech@nbkrist.edu.in', '9848022338', '2nd Year', 'mech@123', 'student']
  );

  // 3. Seed Events with:
  // - End datetime (for automated expiration)
  // - Branch restrictions (ISTE by MECH; IEEE by CSE, AIDS, AIML, IT or All)
  // - Year restrictions
  // - Hackathon details & team size
  // - Officials: Correspondent Sreenivasulu, Physical Head Mallikarjuna, CSE HOD Rajasekar Reddy
  const eventsData = [
    {
      title: 'IEEE NBKRIST Student Branch: National Tech Colloquium & Paper Contest',
      tagline: 'Research Presentations, IoT Innovations & IEEE Technical Contests',
      category: 'IEEE Events',
      description: 'Organized by the IEEE NBKRIST Student Branch. Open to technical students with interest in cutting-edge computing, AI, and smart systems. Keynotes by IEEE senior members and certificates.',
      date: '2026-10-24',
      time: '09:30 AM - 04:30 PM',
      end_datetime: '2026-10-24T18:00:00.000Z',
      venue: 'Seminar Hall 1',
      organizer: 'IEEE NBKRIST Student Branch',
      banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      total_seats: 250,
      booked_seats: 120,
      price: 0,
      allowed_branches: 'CSE, AIDS, AIML, IT',
      allowed_years: '2nd, 3rd & 4th Year',
      is_hackathon: 0,
      max_team_size: 1,
      correspondent_name: 'Sreenivasulu',
      cse_hod_name: 'Dr. Rajasekar Reddy',
      physical_dept_head: null,
      instructions: '1. Please bring 2 hard copies of your IEEE format paper. 2. Formal dress code mandatory. 3. Presentation time: 8 mins + 2 mins Q&A.',
      tiers: [
        { name: 'IEEE Member Free Entry Pass', price: 0, perks: 'Symposium slot, conference kit, participation certificate', count: 180 },
        { name: 'Non-IEEE Delegate Pass', price: 5, perks: 'Symposium slot, certificate & presentation kit', count: 70 }
      ]
    },
    {
      title: 'CSE Department Mega Hackathon: CodeSprint NBKRIST 2026',
      tagline: '24-Hour AI, Web3 & Smart Campus Coding Marathon',
      category: 'CSE Dept Events',
      description: 'The flagship hackathon of the Department of Computer Science & Engineering (CSE) at N.B.K.R.I.S.T. Build real-time solutions for smart governance, agricultural AI, and cybersecurity. Mentors from top MNCs, unlimited Wi-Fi, midnight snacks, and cash prizes worth Rs. 50,000.',
      date: '2026-10-28',
      time: '10:00 AM - 10:00 AM (Next Day)',
      end_datetime: '2026-10-29T11:00:00.000Z',
      venue: 'Seminar Hall 2',
      organizer: 'Department of Computer Science & Engineering (CSE)',
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      total_seats: 200,
      booked_seats: 136,
      price: 0,
      allowed_branches: 'CSE, AIDS, AIML, IT',
      allowed_years: 'All Years',
      is_hackathon: 1,
      max_team_size: 4,
      correspondent_name: 'Sreenivasulu',
      cse_hod_name: 'Dr. Rajasekar Reddy',
      physical_dept_head: null,
      instructions: '1. Teams can comprise 2 to 4 students. 2. Bring your laptops, chargers and student ID cards. 3. Power sockets and high-speed LAN provided in Seminar Hall 2. 4. Pre-built templates disqualified.',
      tiers: [
        { name: 'Hackathon Team Pass (Free Entry)', price: 0, perks: 'Access for up to 4 members, meals, overnight lab access, mentor evaluation', count: 150 },
        { name: 'Hackathon Pro + Cloud GPU Credits', price: 10, perks: '$50 GPU compute credits per team, certificate & fast-track review', count: 50 }
      ]
    },
    {
      title: 'N.B.K.R.I.S.T Annual College Fest: AURA 2026',
      tagline: 'Mega Cultural Fiesta, Battle of the Bands, Celebrity Star Night & Food Carnival',
      category: 'College Fest',
      description: 'The monumental cultural festival of N.B.K.R.I.S.T celebrating artistic brilliance across all branches and batches. Features live music, solo & group dance wars, fashion show, short film screenings, and a star-studded musical concert on the grand open stage.',
      date: '2026-11-06',
      time: '04:00 PM - 11:00 PM',
      end_datetime: '2026-11-06T23:59:59.000Z',
      venue: 'N.B.K.R.I.S.T Main Open Air Auditorium & Grounds',
      organizer: 'N.B.K.R.I.S.T Student Council & College Fest Committee',
      banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      total_seats: 1200,
      booked_seats: 890,
      price: 10,
      allowed_branches: 'All Branches',
      allowed_years: 'All Years',
      is_hackathon: 0,
      max_team_size: 1,
      correspondent_name: 'Sreenivasulu',
      cse_hod_name: null,
      physical_dept_head: null,
      instructions: '1. College ID card is mandatory for gate entrance. 2. Outside eatables not permitted inside the amphitheatre. 3. QR pass will be scanned at Gate 1 and Gate 2.',
      tiers: [
        { name: 'General Student Pass', price: 10, perks: 'Admission for all events, concert wristband, 1 food stall coupon', count: 1000 },
        { name: 'Fan Pit VIP Pass', price: 20, perks: 'Front-row fan enclosure, artist photo-op, glowband', count: 200 }
      ]
    },
    {
      title: 'ISTE (IST) Mechanical Chapter: TECHMECH National Symposium',
      tagline: 'CAD Modeling, Lathe Master Challenge & Thermal Engineering Paper Contest',
      category: 'ISTE / IST Events',
      description: 'Conducted proudly by the Mechanical Engineering Department under ISTE (IST) Students Chapter, N.B.K.R.I.S.T. Involves SolidWorks 3D drafting, robotic arm simulation, IC engine teardown, and technical paper reviews.',
      date: '2026-11-12',
      time: '09:30 AM - 04:30 PM',
      end_datetime: '2026-11-12T18:00:00.000Z',
      venue: 'Seminar Hall 1',
      organizer: 'Department of Mechanical Engineering & ISTE (IST) Chapter',
      banner_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      total_seats: 180,
      booked_seats: 98,
      price: 0,
      allowed_branches: 'MECH',
      allowed_years: 'All Years',
      is_hackathon: 0,
      max_team_size: 1,
      correspondent_name: 'Sreenivasulu',
      cse_hod_name: null,
      physical_dept_head: null,
      instructions: '1. Exclusive for Mechanical Engineering students. 2. Safety shoes and lab coat required for workshop round.',
      tiers: [
        { name: 'Mechanical Student Free Pass', price: 0, perks: 'Symposium entry, CAD workbench slot, participation certificate', count: 180 }
      ]
    },
    {
      title: 'N.B.K.R.I.S.T Annual Inter-Department Sports Derby: Cricket & Volleyball Finals',
      tagline: 'CSE Strikers vs Mechanical Titans Derby for the Championship Trophy',
      category: 'Physical Dept / Sports',
      description: 'Organized by the Department of Physical Education under the guidance of Physical Director Mallikarjuna and Correspondent Sreenivasulu. Floodlit finals with live commentary, student brass band, and award ceremony.',
      date: '2026-10-22',
      time: '03:30 PM - 07:30 PM',
      end_datetime: '2026-10-22T21:00:00.000Z',
      venue: 'N.B.K.R.I.S.T Sports Stadium & Floodlit Turf',
      organizer: 'Department of Physical Education, N.B.K.R.I.S.T',
      banner_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      total_seats: 500,
      booked_seats: 380,
      price: 0,
      allowed_branches: 'All Branches',
      allowed_years: 'All Years',
      is_hackathon: 0,
      max_team_size: 1,
      correspondent_name: 'Sreenivasulu',
      cse_hod_name: null,
      physical_dept_head: 'Mallikarjuna',
      instructions: '1. Open cheering stands for all N.B.K.R.I.S.T students. 2. Maintain sportsman spirit. 3. Halftime refreshments included.',
      tiers: [
        { name: 'Free Cheering Bleachers Pass', price: 0, perks: 'Stadium seating, cheering whistle, tournament program', count: 500 }
      ]
    }
  ];

  const createdEventIds = [];
  for (const ev of eventsData) {
    const res = run(
      `INSERT INTO events (
        title, tagline, category, description, date, time, end_datetime, venue, organizer,
        banner_url, total_seats, booked_seats, price, allowed_branches, allowed_years,
        is_hackathon, max_team_size, correspondent_name, cse_hod_name, physical_dept_head,
        instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ev.title, ev.tagline, ev.category, ev.description, ev.date, ev.time, ev.end_datetime,
        ev.venue, ev.organizer, ev.banner_url, ev.total_seats, ev.booked_seats, ev.price,
        ev.allowed_branches, ev.allowed_years, ev.is_hackathon, ev.max_team_size,
        ev.correspondent_name, ev.cse_hod_name, ev.physical_dept_head, ev.instructions
      ]
    );

    const eventId = res.lastInsertRowid;
    createdEventIds.push(eventId);
    for (const tier of ev.tiers) {
      run(
        `INSERT INTO ticket_tiers (event_id, name, price, perks, available_count)
         VALUES (?, ?, ?, ?, ?)`,
        [eventId, tier.name, tier.price, tier.perks, tier.count]
      );
    }
  }

  // 4. Seed Sample Registered Passes
  const allEvents = all('SELECT id FROM events ORDER BY id ASC');
  const sampleTickets = [
    {
      ticket_code: 'NBKR-2026-IEEE1',
      event_id: allEvents[0]?.id || 1,
      user_id: 1,
      tier_name: 'IEEE Member Free Entry Pass',
      attendee_name: 'V. Sai Charan',
      attendee_email: 'saicharan.cse@nbkrist.edu.in',
      attendee_roll_no: '22NB1A05A1',
      attendee_dept: 'CSE',
      attendee_year: '3rd Year',
      attendee_phone: '9876543210',
      quantity: 1,
      total_price: 0,
      is_hackathon: 0,
      team_name: null,
      team_members_json: null,
      status: 'CONFIRMED'
    },
    {
      ticket_code: 'NBKR-2026-HACK2',
      event_id: allEvents[1]?.id || 2,
      user_id: 1,
      tier_name: 'Hackathon Team Pass (Free Entry)',
      attendee_name: 'V. Sai Charan (Lead)',
      attendee_email: 'saicharan.cse@nbkrist.edu.in',
      attendee_roll_no: '22NB1A05A1',
      attendee_dept: 'CSE',
      attendee_year: '3rd Year',
      attendee_phone: '9876543210',
      quantity: 1,
      total_price: 0,
      is_hackathon: 1,
      team_name: 'AlgoTitans NBKR',
      team_members_json: JSON.stringify([
        { name: 'V. Sai Charan (Lead)', roll_no: '22NB1A05A1', branch: 'CSE' },
        { name: 'K. Sneha', roll_no: '22NB1A05C4', branch: 'CSE' },
        { name: 'R. Praneeth', roll_no: '22NB1A05H2', branch: 'AIDS' },
        { name: 'M. Harsha', roll_no: '22NB1A05K8', branch: 'IT' }
      ]),
      status: 'CONFIRMED'
    }
  ];

  for (const tkt of sampleTickets) {
    run(
      `INSERT INTO tickets (
        ticket_code, event_id, user_id, tier_name, attendee_name, attendee_email,
        attendee_roll_no, attendee_dept, attendee_year, attendee_phone, quantity,
        total_price, is_hackathon, team_name, team_members_json, payment_status,
        payment_ref, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', 'COLLEGE-PASS', ?)`,
      [
        tkt.ticket_code, tkt.event_id, tkt.user_id, tkt.tier_name, tkt.attendee_name,
        tkt.attendee_email, tkt.attendee_roll_no, tkt.attendee_dept, tkt.attendee_year,
        tkt.attendee_phone, tkt.quantity, tkt.total_price, tkt.is_hackathon,
        tkt.team_name, tkt.team_members_json, tkt.status
      ]
    );
  }

  // 5. Seed Campus OpenMind Ideas / Proposals
  const samplePosts = [
    {
      user_id: 1,
      author_name: 'V. Sai Charan',
      author_branch: 'CSE',
      author_year: '3rd Year',
      is_anonymous: 0,
      category: 'Ideas & Clubs',
      mood_tag: 'Idea / Proposal',
      title: 'Idea: Launching an Open-Source Student Developers Club at N.B.K.R.I.S.T',
      content: 'We are proposing an open-source development chapter where seniors can guide 1st and 2nd years in contributing to real Github repositories, preparing for GSOC, and collaborating on campus web apps in Seminar Hall 2 on weekends.',
      upvotes: 54,
      comments: [
        { author_name: 'Kailash (Lead Coordinator)', author_branch: 'CSE', is_anonymous: 0, content: 'Excellent proposal! As coordinators we can easily book Seminar Hall 2 for Saturday sessions. Let us schedule a kickoff meeting.' },
        { author_name: 'TechSeeker_26', author_branch: 'AIDS', is_anonymous: 1, content: '100% support this! Count in the AI&DS batch as well.' }
      ]
    },
    {
      user_id: 2,
      author_name: 'M. Akhil',
      author_branch: 'MECH',
      author_year: '2nd Year',
      is_anonymous: 0,
      category: 'Campus Life',
      mood_tag: 'Project Discussion',
      title: 'Preparing for the TECHMECH Symposium in Seminar Hall 1',
      content: 'Any Mechanical seniors working on Formula Student or EV prototyping? We are setting up a display stall for the ISTE event and looking for feedback on our regenerative braking model.',
      upvotes: 41,
      comments: [
        { author_name: 'SeniorMech_Lead', author_branch: 'MECH', is_anonymous: 0, content: 'Reach out to the CAD lab tomorrow during the lunch break. We will review your 3D assembly.' }
      ]
    }
  ];

  for (const post of samplePosts) {
    const pRes = run(
      `INSERT INTO openmind_posts (
        user_id, author_name, author_branch, author_year, is_anonymous,
        category, mood_tag, title, content, upvotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.user_id, post.author_name, post.author_branch, post.author_year,
        post.is_anonymous, post.category, post.mood_tag, post.title, post.content, post.upvotes
      ]
    );

    const postId = pRes.lastInsertRowid;
    for (const c of post.comments) {
      run(
        `INSERT INTO post_comments (post_id, user_id, author_name, author_branch, is_anonymous, content)
         VALUES (?, 1, ?, ?, ?, ?)`,
        [postId, c.author_name, c.author_branch || 'CSE', c.is_anonymous, c.content]
      );
    }
  }

  saveDB();
  console.log('N.B.K.R.I.S.T platform seeded with coordinators and full event eligibility rules!');
}

seed().catch(err => console.error('Seed error:', err));
