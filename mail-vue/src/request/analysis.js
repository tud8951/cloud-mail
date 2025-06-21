import http from '@/axios/index.js'

export function analysisEcharts() {
    return http.get('/analysis/echarts');
}