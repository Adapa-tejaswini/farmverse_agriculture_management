const pool = require("../config/db");

const formatNotification = (row) => ({
  id: row.id,
  notificationKey: row.notification_key,
  type: row.type,
  title: row.title,
  message: row.message,
  priority: row.priority,
  source: row.source,
  actionUrl: row.action_url,
  isRead: row.is_read,
  readAt: row.read_at,
  metadata: row.metadata,
  createdAt: row.created_at,
});

const ensurePreferences = async (userId) => {
  await pool.query(
    `INSERT INTO notification_preferences (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  const result = await pool.query(
    `SELECT *
     FROM notification_preferences
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0];
};

const daysUntil = (dateValue) => {
  if (!dateValue) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const upsertNotification = async ({
  userId,
  notificationKey,
  type,
  title,
  message,
  priority = "medium",
  source = "system",
  actionUrl = null,
  metadata = {},
}) => {
  const result = await pool.query(
    `INSERT INTO notifications
     (
       user_id,
       notification_key,
       type,
       title,
       message,
       priority,
       source,
       action_url,
       metadata
     )
     VALUES
     ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     ON CONFLICT (user_id, notification_key)
     WHERE notification_key IS NOT NULL
     DO UPDATE SET
       type = EXCLUDED.type,
       title = EXCLUDED.title,
       message = EXCLUDED.message,
       priority = EXCLUDED.priority,
       source = EXCLUDED.source,
       action_url = EXCLUDED.action_url,
       metadata = EXCLUDED.metadata
     RETURNING *`,
    [
      userId,
      notificationKey,
      type,
      title,
      message,
      priority,
      source,
      actionUrl,
      JSON.stringify(metadata),
    ]
  );

  return result.rows[0];
};

const generateSmartNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await ensurePreferences(userId);

    if (!preferences.in_app_enabled) {
      return res.status(200).json({
        message: "In-app notifications are disabled.",
        generatedCount: 0,
        notifications: [],
      });
    }

    const generated = [];

    const farmsResult = await pool.query(
      `SELECT *
       FROM farms
       WHERE farmer_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const cropsResult = await pool.query(
      `SELECT
         crops.*,
         farms.farm_name,
         farms.location AS farm_location,
         farms.soil_type AS farm_soil_type,
         farms.irrigation_type AS farm_irrigation_type
       FROM crops
       LEFT JOIN farms ON crops.farm_id = farms.id
       WHERE crops.farmer_id = $1
       ORDER BY crops.created_at DESC`,
      [userId]
    );

    const farms = farmsResult.rows;
    const crops = cropsResult.rows;

    if (farms.length === 0) {
      generated.push(
        await upsertNotification({
          userId,
          notificationKey: "setup-add-farm",
          type: "setup",
          title: "Add your first farm",
          message:
            "Add farm location, soil type, and irrigation method to get better crop and weather guidance.",
          priority: "high",
          actionUrl: "/farm-management",
        })
      );
    }

    if (farms.length > 0 && crops.length === 0) {
      generated.push(
        await upsertNotification({
          userId,
          notificationKey: "setup-add-crop",
          type: "setup",
          title: "Add crop records",
          message:
            "Add your active crops with growth stage and harvest date to receive smart reminders.",
          priority: "high",
          actionUrl: "/crop-management",
        })
      );
    }

    if (preferences.weather_alerts) {
      for (const farm of farms) {
        generated.push(
          await upsertNotification({
            userId,
            notificationKey: `weather-check-${farm.id}`,
            type: "weather",
            title: `Weather check for ${farm.farm_name}`,
            message:
              "Check rainfall forecast before irrigation. If rain chance is high, avoid unnecessary watering.",
            priority: "medium",
            actionUrl: "/weather",
            metadata: { farmId: farm.id },
          })
        );

        if (farm.irrigation_type === "Rain-fed") {
          generated.push(
            await upsertNotification({
              userId,
              notificationKey: `rainfed-${farm.id}`,
              type: "weather",
              title: "Rain-fed farm advisory",
              message: `${farm.farm_name} is marked as rain-fed. Track rainfall and plan drought-tolerant crops when rainfall is uncertain.`,
              priority: "high",
              actionUrl: "/weather",
              metadata: { farmId: farm.id },
            })
          );
        }
      }
    }

    for (const crop of crops) {
      const harvestDays = daysUntil(crop.expected_harvest_date);

      if (
        preferences.harvest_reminders &&
        harvestDays !== null &&
        harvestDays >= 0 &&
        harvestDays <= 7 &&
        crop.crop_status !== "Harvested"
      ) {
        generated.push(
          await upsertNotification({
            userId,
            notificationKey: `harvest-${crop.id}`,
            type: "harvest",
            title: `${crop.crop_name} harvest reminder`,
            message:
              harvestDays === 0
                ? `${crop.crop_name} may be ready for harvest today. Check crop maturity before harvesting.`
                : `${crop.crop_name} expected harvest is in ${harvestDays} day(s). Prepare labor, crates, storage, and market plan.`,
            priority: "high",
            actionUrl: "/crop-management",
            metadata: { cropId: crop.id },
          })
        );
      }

      if (preferences.crop_stage_alerts && crop.growth_stage === "Flowering") {
        generated.push(
          await upsertNotification({
            userId,
            notificationKey: `flowering-${crop.id}`,
            type: "crop",
            title: `${crop.crop_name} flowering stage alert`,
            message:
              "Maintain stable soil moisture. Monitor flower drop, thrips, whiteflies, and fungal symptoms.",
            priority: "high",
            actionUrl: `/fertilizer?cropId=${crop.id}`,
            metadata: { cropId: crop.id },
          })
        );
      }

      if (preferences.crop_stage_alerts && crop.growth_stage === "Fruiting") {
        generated.push(
          await upsertNotification({
            userId,
            notificationKey: `fruiting-${crop.id}`,
            type: "crop",
            title: `${crop.crop_name} fruiting stage alert`,
            message:
              "Maintain regular irrigation and monitor fruit borer, spots, and nutrient stress.",
            priority: "high",
            actionUrl: `/disease-detection?cropId=${crop.id}`,
            metadata: { cropId: crop.id },
          })
        );
      }

      if (
        preferences.fertilizer_alerts &&
        !crop.soil_ph &&
        !crop.nitrogen &&
        !crop.phosphorus &&
        !crop.potassium
      ) {
        generated.push(
          await upsertNotification({
            userId,
            notificationKey: `soil-missing-${crop.id}`,
            type: "fertilizer",
            title: `Soil data missing for ${crop.crop_name}`,
            message:
              "Add soil pH and NPK values from a Soil Health Card for better fertilizer guidance.",
            priority: "medium",
            actionUrl: `/fertilizer?cropId=${crop.id}`,
            metadata: { cropId: crop.id },
          })
        );
      }
    }

    if (preferences.scheme_alerts) {
      const schemesResult = await pool.query(
        `SELECT *
         FROM government_schemes
         WHERE is_active = true
         ORDER BY scheme_name ASC
         LIMIT 10`
      );

      for (const scheme of schemesResult.rows) {
        generated.push(
          await upsertNotification({
            userId,
            notificationKey: `scheme-${scheme.scheme_code}`,
            type: "scheme",
            title: scheme.scheme_name,
            message: scheme.description,
            priority: "medium",
            source: "government_scheme",
            actionUrl: scheme.official_link || null,
            metadata: {
              schemeCode: scheme.scheme_code,
              category: scheme.category,
              state: scheme.state,
            },
          })
        );
      }
    }

    return res.status(200).json({
      message: "Smart notifications generated.",
      generatedCount: generated.length,
      notifications: generated.map(formatNotification),
    });
  } catch (error) {
    console.error("Generate notifications error:", error);

    return res.status(500).json({
      message: "Could not generate smart notifications.",
      error: error.message,
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    return res.status(200).json({
      notifications: result.rows.map(formatNotification),
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      message: "Could not load notifications.",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true,
           read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    return res.status(200).json({
      message: "Notification marked as read.",
      notification: result.rows[0] ? formatNotification(result.rows[0]) : null,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      message: "Could not update notification.",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = true,
           read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    return res.status(200).json({
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      message: "Could not update notifications.",
    });
  }
};

const clearNotifications = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM notifications
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      message: "Notifications cleared.",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);

    return res.status(500).json({
      message: "Could not clear notifications.",
    });
  }
};

const getNotificationPreferences = async (req, res) => {
  try {
    const preferences = await ensurePreferences(req.user.id);

    return res.status(200).json({
      preferences,
    });
  } catch (error) {
    console.error("Get preferences error:", error);

    return res.status(500).json({
      message: "Could not load notification preferences.",
    });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const fields = [
      "in_app_enabled",
      "weather_alerts",
      "scheme_alerts",
      "harvest_reminders",
      "crop_stage_alerts",
      "fertilizer_alerts",
      "disease_alerts",
    ];

    const values = fields.map((field) =>
      typeof req.body[field] === "boolean" ? req.body[field] : null
    );

    await ensurePreferences(req.user.id);

    const result = await pool.query(
      `UPDATE notification_preferences
       SET
         in_app_enabled = COALESCE($2, in_app_enabled),
         weather_alerts = COALESCE($3, weather_alerts),
         scheme_alerts = COALESCE($4, scheme_alerts),
         harvest_reminders = COALESCE($5, harvest_reminders),
         crop_stage_alerts = COALESCE($6, crop_stage_alerts),
         fertilizer_alerts = COALESCE($7, fertilizer_alerts),
         disease_alerts = COALESCE($8, disease_alerts),
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [req.user.id, ...values]
    );

    return res.status(200).json({
      message: "Notification preferences updated.",
      preferences: result.rows[0],
    });
  } catch (error) {
    console.error("Update preferences error:", error);

    return res.status(500).json({
      message: "Could not update notification preferences.",
    });
  }
};

module.exports = {
  generateSmartNotifications,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
};