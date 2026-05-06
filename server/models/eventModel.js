const pool = require('../db/pool');

module.exports.list = async () => {
  const query = `
    SELECT
        events.*,
        users.username,
        COUNT(rsvps.rsvp_id) AS rsvp_count
    FROM 
        events
        INNER JOIN users ON events.user_id = users.user_id
        LEFT JOIN rsvps ON events.event_id = rsvps.event_id
    GROUP BY 
        events.event_id, 
        users.username
    ORDER BY events.date ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

module.exports.find = async (event_id) => {
  const query = `
    SELECT
        events.*,
        users.username,
        COUNT(rsvps.rsvp_id) AS rsvp_count
    FROM 
        events
        INNER JOIN users ON events.user_id = users.user_id
        LEFT JOIN rsvps ON events.event_id = rsvps.event_id
    WHERE 
        events.event_id = $1
    GROUP BY 
        events.event_id, 
        users.username
    ORDER BY events.date ASC
  `;
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};

module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT
        events.*,
        users.username,
        COUNT(rsvps.rsvp_id) AS rsvp_count
    FROM 
        events
        INNER JOIN users ON events.user_id = users.user_id
        LEFT JOIN rsvps ON events.event_id = rsvps.event_id
    WHERE
        events.user_id = $1
    GROUP BY 
        events.event_id, 
        users.username
    ORDER BY events.date ASC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

module.exports.create = async (title, description, date, location, event_type, max_capacity, user_id) => {
  const query = `
    INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING 
      event_id, 
      title, 
      description, 
      date, 
      location, 
      event_type, 
      max_capacity, 
      user_id
  `;
  const { rows } = await pool.query(query, [title, description, date, location, event_type, max_capacity, user_id]);
  return rows[0];
};

module.exports.update = async (title, description, date, location, event_type, max_capacity, event_id) => {
  const query = `
    UPDATE 
      events
    SET 
      title = $1, 
      description = $2, 
      date = $3, 
      location = $4,
      event_type = $5,
      max_capacity = $6
    WHERE 
      event_id = $7
    RETURNING 
      event_id, 
      title, 
      description, 
      date, 
      location,
      event_type,
      max_capacity
  `;
  const { rows } = await pool.query(query, [title, description, date, location, event_type, max_capacity, event_id]);
  return rows[0] || null;
};

module.exports.destroy = async (event_id) => {
  const query = `
    DELETE FROM events
    WHERE 
      event_id = $1
    RETURNING 
      event_id, 
      title, 
      description, 
      date, 
      location,
      event_type,
      max_capacity,
      user_id
  `;
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};
