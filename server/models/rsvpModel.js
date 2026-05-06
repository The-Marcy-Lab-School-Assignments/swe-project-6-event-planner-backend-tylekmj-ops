const pool = require('../db/pool');

module.exports.list = async () => {
  const query = `
    SELECT
        events.*,
        users.username,
        COUNT(rsvps.rsvp_id) AS rsvp_count
    FROM 
        rsvps
        INNER JOIN users ON rsvps.user_id = users.user_id
        LEFT JOIN events ON rsvps.event_id = events.event_id
    GROUP BY 
        events.event_id,
        users.username
    ORDER BY events.date ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

module.exports.find = async (rsvp_id) => {
  const query = `
    SELECT
        events.*,
        users.username,
        COUNT(rsvps.rsvp_id) AS rsvp_count
    FROM 
        rsvps
        INNER JOIN users ON rsvps.user_id = users.user_id
        LEFT JOIN events ON rsvps.event_id = events.event_id
    WHERE 
        rsvps.rsvp_id = $1
    GROUP BY 
        events.event_id,
        users.username
    ORDER BY events.date ASC
  `;
  const { rows } = await pool.query(query, [rsvp_id]);
  return rows[0] || null;
};

module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT
        events.*,
        users.username,
        COUNT(rsvps.rsvp_id) AS rsvp_count
    FROM 
        rsvps
        INNER JOIN users ON rsvps.user_id = users.user_id
        INNER JOIN events ON rsvps.event_id = events.event_id
    WHERE
        rsvps.user_id = $1
    GROUP BY 
        events.event_id,
        users.username
    ORDER BY events.date ASC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

module.exports.create = async (user_id, event_id) => {
  const query = `
    INSERT INTO rsvps (user_id, event_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, event_id) DO NOTHING
    RETURNING
      rsvp_id,
      event_id,
      user_id
  `;
  const { rows } = await pool.query(query, [user_id, event_id]);
  return rows[0] || null;
};

module.exports.destroyByUserAndEvent = async (user_id, event_id) => {
  const query = `
    DELETE FROM rsvps
    WHERE user_id = $1 AND event_id = $2
    RETURNING
      rsvp_id,
      event_id,
      user_id
  `;
  const { rows } = await pool.query(query, [user_id, event_id]);
  return rows[0] || null;
};