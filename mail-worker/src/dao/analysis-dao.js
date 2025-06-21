const analysisDao = {
	async numberCount(c) {
		const { results } = await c.env.db.prepare(`
            SELECT
                e.receiveTotal,
                e.sendTotal,
                e.delReceiveTotal,
                e.delSendTotal,
                e.normalReceiveTotal,
                e.normalSendTotal,
                u.userTotal,
                u.normalUserTotal,
                u.delUserTotal,
                a.accountTotal,
                a.normalAccountTotal,
                a.delAccountTotal
            FROM
                (
                    SELECT
                        SUM(CASE WHEN type = 0 THEN 1 ELSE 0 END) AS receiveTotal,
                        SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS sendTotal,
                        SUM(CASE WHEN type = 0 AND is_del = 1 THEN 1 ELSE 0 END) AS delReceiveTotal,
                        SUM(CASE WHEN type = 1 AND is_del = 1 THEN 1 ELSE 0 END) AS delSendTotal,
                        SUM(CASE WHEN type = 0 AND is_del = 0 THEN 1 ELSE 0 END) AS normalReceiveTotal,
                        SUM(CASE WHEN type = 1 AND is_del = 0 THEN 1 ELSE 0 END) AS normalSendTotal
                    FROM
                        email
                ) e
            CROSS JOIN (
                SELECT
                    COUNT(*) AS userTotal,
                    SUM(CASE WHEN is_del = 1 THEN 1 ELSE 0 END) AS delUserTotal,
                    SUM(CASE WHEN is_del = 0 THEN 1 ELSE 0 END) AS normalUserTotal
                FROM
                    user
            ) u
            CROSS JOIN (
                SELECT
                    COUNT(*) AS accountTotal,
                    SUM(CASE WHEN is_del = 1 THEN 1 ELSE 0 END) AS delAccountTotal,
                    SUM(CASE WHEN is_del = 0 THEN 1 ELSE 0 END) AS normalAccountTotal
                FROM
                    account
            ) a
        `).all();
		return results[0];
	},

	async userDayCount(c) {
		const { results } = await c.env.db.prepare(`
            SELECT
                DATE(create_time,'+8 hours') AS date,
                COUNT(*) AS total
            FROM
                user
            WHERE
                DATE(create_time,'+8 hours') BETWEEN DATE('now', '-15 days', '+8 hours') AND DATE('now','-1 day','+8 hours')
            GROUP BY
                DATE(create_time,'+8 hours')
            ORDER BY
                date ASC
        `).all();
		return results;
	},

	async receiveDayCount(c) {
		const { results } = await c.env.db.prepare(`
            SELECT
                DATE(create_time,'+8 hours') AS date,
                COUNT(*) AS total
            FROM
                email
            WHERE
			  				DATE(create_time,'+8 hours') BETWEEN DATE('now', '-15 days', '+8 hours') AND DATE('now','-1 day','+8 hours')
                AND type = 0
            GROUP BY
                DATE(create_time,'+8 hours')
            ORDER BY
                date ASC
        `).all();
		return results;
	},

	async sendDayCount(c) {
		const { results } = await c.env.db.prepare(`
            SELECT
                DATE(create_time,'+8 hours') AS date,
                COUNT(*) AS total
            FROM
                email
            WHERE
			  				DATE(create_time,'+8 hours') BETWEEN DATE('now', '-15 days', '+8 hours') AND DATE('now','-1 day','+8 hours')
                AND type = 1
            GROUP BY
                DATE(create_time,'+8 hours')
            ORDER BY
                date ASC
        `).all();
		return results;
	}

};

export default analysisDao;
