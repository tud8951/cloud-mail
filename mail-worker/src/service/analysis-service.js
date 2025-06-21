import analysisDao from '../dao/analysis-dao';
import orm from '../entity/orm';
import email from '../entity/email';
import { desc, count, eq } from 'drizzle-orm';
import { emailConst } from '../const/entity-const';
import kvConst from '../const/kv-const';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
dayjs.extend(timezone)
const analysisService = {

	async echarts(c) {


		const [
			numberCount,
			nameRatio,
			sendEmailRatio,
			userDayCountRaw,
			receiveDayCountRaw,
			sendDayCountRaw,
			daySendTotalRaw
		] = await Promise.all([
			analysisDao.numberCount(c),

			orm(c)
				.select({ name: email.name, total: count() })
				.from(email)
				.where(eq(email.type, emailConst.type.RECEIVE))
				.groupBy(email.name)
				.orderBy(desc(count()))
				.limit(6),

			orm(c)
				.select({ email: email.sendEmail, total: count() })
				.from(email)
				.where(eq(email.type, emailConst.type.RECEIVE))
				.groupBy(email.sendEmail)
				.orderBy(desc(count()))
				.limit(6),

			analysisDao.userDayCount(c),
			analysisDao.receiveDayCount(c),
			analysisDao.sendDayCount(c),

			c.env.kv.get(kvConst.SEND_DAY_COUNT + dayjs().format('YYYY-MM-DD')),
		]);


		const userDayCount = this.filterEmptyDay(userDayCountRaw);
		const receiveDayCount = this.filterEmptyDay(receiveDayCountRaw);
		const sendDayCount = this.filterEmptyDay(sendDayCountRaw);

		const daySendTotal = daySendTotalRaw || 0;

		return {
			numberCount,
			userDayCount,
			receiveRatio: {
				nameRatio,
				sendEmailRatio
			},
			emailDayCount: {
				receiveDayCount,
				sendDayCount
			},
			daySendTotal: Number(daySendTotal)
		};
	},

	filterEmptyDay(data) {
		const today = dayjs().tz('Asia/Shanghai').subtract(1, 'day');
		const previousDays = Array.from({ length: 15 }, (_, i) => {
			return today.subtract(i, 'day').format('YYYY-MM-DD');
		}).reverse();

		return  previousDays.map(day => {
			const index = data.findIndex(item => item.date === day)
			const total = index > - 1 ? data[index].total : 0
			return {date: day,total}
		})

	}
}

export default  analysisService
