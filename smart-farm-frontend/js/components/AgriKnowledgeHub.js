const AgriKnowledgeHub = {
    template: `
        <div class="agri-knowledge-hub">
            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="24" :lg="8">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>天气决策输入</span>
                                <el-button size="small" type="primary" :loading="weatherLoading" @click="loadWeather">
                                    <i class="fas fa-rotate" style="margin-right: 6px;"></i>刷新
                                </el-button>
                            </div>
                        </template>
                        <el-form :inline="true" size="small" style="margin-bottom: 10px;">
                            <el-form-item label="省份" style="margin-bottom: 8px;">
                                <el-select v-model="selectedProvince" placeholder="选择省份" style="width: 120px;" @change="onProvinceChange">
                                    <el-option v-for="p in provinces" :key="p" :label="p" :value="p"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="城市" style="margin-bottom: 8px;">
                                <el-select v-model="selectedCity" placeholder="选择城市" style="width: 120px;" :disabled="!selectedProvince" @change="onCityChange">
                                    <el-option v-for="c in cities" :key="c" :label="c" :value="c"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <el-alert v-if="weatherError" :title="weatherError" type="warning" :closable="false" style="margin-bottom: 12px;"></el-alert>
                        <el-descriptions :column="2" size="small" border>
                            <el-descriptions-item label="温度">{{ formatValue(weatherDecision.temperature, '℃') }}</el-descriptions-item>
                            <el-descriptions-item label="湿度">{{ formatValue(weatherDecision.humidity, '%') }}</el-descriptions-item>
                            <el-descriptions-item label="降雨">{{ formatValue(weatherDecision.precipitation, 'mm') }}</el-descriptions-item>
                            <el-descriptions-item label="风速">{{ formatValue(weatherDecision.windSpeed, 'm/s') }}</el-descriptions-item>
                            <el-descriptions-item label="土温">{{ formatValue(weatherDecision.soilTemperature, '℃') }}</el-descriptions-item>
                            <el-descriptions-item label="土壤水分">{{ formatValue(weatherDecision.soilMoisture, '') }}</el-descriptions-item>
                        </el-descriptions>
                        <div style="margin-top: 12px;">
                            <el-tag v-for="hint in weatherDecision.riskHints || []" :key="hint" type="warning" style="margin: 0 6px 6px 0;">
                                {{ hint }}
                            </el-tag>
                            <el-tag v-if="!(weatherDecision.riskHints || []).length" type="info">暂无风险提示</el-tag>
                        </div>
                        <div class="agent-input-text">{{ weatherDecision.agentInputText || '启动后端后可加载 Open-Meteo 天气决策输入。' }}</div>
                    </el-card>
                </el-col>

                <el-col :xs="24" :lg="16">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>未来天气折线图</span>
                                <el-tag size="small" type="success">Open-Meteo</el-tag>
                            </div>
                        </template>
                        <div ref="forecastChartRef" class="hub-chart"></div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="24" :lg="10">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>RAG 文章来源列表</span>
                                <el-tag size="small">{{ ragSources.length }} 条</el-tag>
                            </div>
                        </template>
                        <el-table :data="ragSources" size="small" height="360" border>
                            <el-table-column prop="title" label="标题" min-width="220"></el-table-column>
                            <el-table-column prop="type" label="类型" width="110"></el-table-column>
                            <el-table-column label="来源" width="92">
                                <template #default="{ row }">
                                    <el-link :href="row.url" target="_blank" type="primary">打开</el-link>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>

                <el-col :xs="24" :lg="14">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>知识图谱关系图</span>
                                <el-button size="small" :loading="graphLoading" @click="loadKnowledgeGraph">
                                    <i class="fas fa-project-diagram" style="margin-right: 6px;"></i>加载关系
                                </el-button>
                            </div>
                        </template>
                        <div ref="kgChartRef" class="hub-chart"></div>
                    </el-card>
                </el-col>
            </el-row>

            <el-card shadow="never" class="hub-card pesticide-panel">
                <template #header>
                    <div class="hub-card-header">
                        <span>农药登记信息 + 安全提示</span>
                        <el-tag size="small" type="danger">安全约束</el-tag>
                    </div>
                </template>
                <el-alert
                    title="具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。"
                    type="error"
                    :closable="false"
                    show-icon
                    style="margin-bottom: 14px;">
                </el-alert>
                <el-table :data="pesticideRegistrations" size="small" border>
                    <el-table-column prop="registrationNo" label="登记证号" width="130"></el-table-column>
                    <el-table-column prop="pesticideName" label="农药名称" min-width="140"></el-table-column>
                    <el-table-column prop="activeIngredient" label="有效成分" min-width="150"></el-table-column>
                    <el-table-column prop="cropOrSite" label="作物/场所" min-width="130"></el-table-column>
                    <el-table-column prop="controlTarget" label="防治对象" min-width="140"></el-table-column>
                    <el-table-column prop="applicationMethod" label="使用方法" min-width="130"></el-table-column>
                    <el-table-column prop="validUntil" label="有效期至" width="120"></el-table-column>
                </el-table>
                <el-empty v-if="!pesticideRegistrations.length" description="暂无登记明细，请先导入真实 pesticide_registration.csv 数据。"></el-empty>
            </el-card>
        </div>
    `,

    setup() {
        const weatherLoading = Vue.ref(false);
        const graphLoading = Vue.ref(false);
        const weatherError = Vue.ref('');
        const forecastChartRef = Vue.ref(null);
        const kgChartRef = Vue.ref(null);
        let forecastChart = null;
        let kgChart = null;

        // 省份城市数据
        const provinceCityMap = {
            '北京市': ['北京市'], '天津市': ['天津市'], '上海市': ['上海市'], '重庆市': ['重庆市'],
            '河北省': ['石家庄市','唐山市','秦皇岛市','邯郸市','邢台市','保定市','张家口市','承德市','沧州市','廊坊市','衡水市'],
            '山西省': ['太原市','大同市','阳泉市','长治市','晋城市','朔州市','晋中市','运城市','忻州市','临汾市','吕梁市'],
            '内蒙古': ['呼和浩特市','包头市','乌海市','赤峰市','通辽市','鄂尔多斯市','呼伦贝尔市','巴彦淖尔市','乌兰察布市'],
            '辽宁省': ['沈阳市','大连市','鞍山市','抚顺市','本溪市','丹东市','锦州市','营口市','阜新市','辽阳市','盘锦市','铁岭市','朝阳市','葫芦岛市'],
            '吉林省': ['长春市','吉林市','四平市','辽源市','通化市','白山市','松原市','白城市'],
            '黑龙江省': ['哈尔滨市','齐齐哈尔市','鸡西市','鹤岗市','双鸭山市','大庆市','伊春市','佳木斯市','七台河市','牡丹江市','黑河市','绥化市'],
            '江苏省': ['南京市','无锡市','徐州市','常州市','苏州市','南通市','连云港市','淮安市','盐城市','扬州市','镇江市','泰州市','宿迁市'],
            '浙江省': ['杭州市','宁波市','温州市','嘉兴市','湖州市','绍兴市','金华市','衢州市','舟山市','台州市','丽水市'],
            '安徽省': ['合肥市','芜湖市','蚌埠市','淮南市','马鞍山市','淮北市','铜陵市','安庆市','黄山市','滁州市','阜阳市','宿州市','六安市','亳州市','池州市','宣城市'],
            '福建省': ['福州市','厦门市','莆田市','三明市','泉州市','漳州市','南平市','龙岩市','宁德市'],
            '江西省': ['南昌市','景德镇市','萍乡市','九江市','新余市','鹰潭市','赣州市','吉安市','宜春市','抚州市','上饶市'],
            '山东省': ['济南市','青岛市','淄博市','枣庄市','东营市','烟台市','潍坊市','济宁市','泰安市','威海市','日照市','临沂市','德州市','聊城市','滨州市','菏泽市'],
            '河南省': ['郑州市','开封市','洛阳市','平顶山市','安阳市','鹤壁市','新乡市','焦作市','濮阳市','许昌市','漯河市','三门峡市','南阳市','商丘市','信阳市','周口市','驻马店市'],
            '湖北省': ['武汉市','黄石市','十堰市','宜昌市','襄阳市','鄂州市','荆门市','孝感市','荆州市','黄冈市','咸宁市','随州市'],
            '湖南省': ['长沙市','株洲市','湘潭市','衡阳市','邵阳市','岳阳市','常德市','张家界市','益阳市','郴州市','永州市','怀化市','娄底市'],
            '广东省': ['广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','梅州市','汕尾市','河源市','阳江市','清远市','东莞市','中山市','潮州市','揭阳市','云浮市'],
            '广西': ['南宁市','柳州市','桂林市','梧州市','北海市','防城港市','钦州市','贵港市','玉林市','百色市','贺州市','河池市','来宾市','崇左市'],
            '海南省': ['海口市','三亚市','三沙市','儋州市'],
            '四川省': ['成都市','自贡市','攀枝花市','泸州市','德阳市','绵阳市','广元市','遂宁市','内江市','乐山市','南充市','眉山市','宜宾市','广安市','达州市','雅安市','巴中市','资阳市'],
            '贵州省': ['贵阳市','六盘水市','遵义市','安顺市','毕节市','铜仁市'],
            '云南省': ['昆明市','曲靖市','玉溪市','保山市','昭通市','丽江市','普洱市','临沧市'],
            '西藏': ['拉萨市','日喀则市','昌都市','林芝市','山南市','那曲市'],
            '陕西省': ['西安市','铜川市','宝鸡市','咸阳市','渭南市','延安市','汉中市','榆林市','安康市','商洛市'],
            '甘肃省': ['兰州市','嘉峪关市','金昌市','白银市','天水市','武威市','张掖市','平凉市','酒泉市','庆阳市','定西市','陇南市'],
            '青海省': ['西宁市','海东市'],
            '宁夏': ['银川市','石嘴山市','吴忠市','固原市','中卫市'],
            '新疆': ['乌鲁木齐市','克拉玛依市','吐鲁番市','哈密市']
        };
        const provinces = Vue.ref(Object.keys(provinceCityMap));
        const cities = Vue.ref([]);
        const selectedProvince = Vue.ref('北京市');
        const selectedCity = Vue.ref('北京市');

        const onProvinceChange = (prov) => {
            cities.value = provinceCityMap[prov] || [];
            selectedCity.value = cities.value[0] || '';
            if (selectedCity.value) loadWeather();
        };
        const onCityChange = () => { loadWeather(); };

        // 初始化城市列表
        cities.value = provinceCityMap[selectedProvince.value] || [];

        const weatherDecision = Vue.ref({});
        const forecast = Vue.ref({ hourly: [] });
        const pesticideRegistrations = Vue.ref([
            {
                registrationNo: 'DEMO-PD-0001',
                pesticideName: '吡虫啉可湿性粉剂',
                activeIngredient: '吡虫啉',
                cropOrSite: '水稻',
                controlTarget: '稻飞虱',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0002',
                pesticideName: '噻虫嗪水分散粒剂',
                activeIngredient: '噻虫嗪',
                cropOrSite: '小麦',
                controlTarget: '蚜虫',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0003',
                pesticideName: '阿维菌素乳油',
                activeIngredient: '阿维菌素',
                cropOrSite: '黄瓜',
                controlTarget: '红蜘蛛',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0004',
                pesticideName: '甲维盐水分散粒剂',
                activeIngredient: '甲氨基阿维菌素苯甲酸盐',
                cropOrSite: '玉米',
                controlTarget: '草地贪夜蛾',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0005',
                pesticideName: '苏云金杆菌悬浮剂',
                activeIngredient: '苏云金杆菌',
                cropOrSite: '甘蓝',
                controlTarget: '菜青虫',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0006',
                pesticideName: '多菌灵可湿性粉剂',
                activeIngredient: '多菌灵',
                cropOrSite: '番茄',
                controlTarget: '灰霉病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0007',
                pesticideName: '代森锰锌可湿性粉剂',
                activeIngredient: '代森锰锌',
                cropOrSite: '马铃薯',
                controlTarget: '晚疫病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0008',
                pesticideName: '苯醚甲环唑水分散粒剂',
                activeIngredient: '苯醚甲环唑',
                cropOrSite: '苹果',
                controlTarget: '斑点落叶病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0009',
                pesticideName: '嘧菌酯悬浮剂',
                activeIngredient: '嘧菌酯',
                cropOrSite: '葡萄',
                controlTarget: '霜霉病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0010',
                pesticideName: '三环唑可湿性粉剂',
                activeIngredient: '三环唑',
                cropOrSite: '水稻',
                controlTarget: '稻瘟病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0011',
                pesticideName: '戊唑醇悬浮剂',
                activeIngredient: '戊唑醇',
                cropOrSite: '小麦',
                controlTarget: '赤霉病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0012',
                pesticideName: '烯酰吗啉水分散粒剂',
                activeIngredient: '烯酰吗啉',
                cropOrSite: '黄瓜',
                controlTarget: '霜霉病',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0013',
                pesticideName: '精喹禾灵乳油',
                activeIngredient: '精喹禾灵',
                cropOrSite: '大豆',
                controlTarget: '一年生禾本科杂草',
                applicationMethod: '茎叶喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0014',
                pesticideName: '草甘膦异丙胺盐水剂',
                activeIngredient: '草甘膦异丙胺盐',
                cropOrSite: '果园',
                controlTarget: '杂草',
                applicationMethod: '定向喷雾',
                validUntil: '2027-12-31'
            },
            {
                registrationNo: 'DEMO-PD-0015',
                pesticideName: '赤霉酸可溶粉剂',
                activeIngredient: '赤霉酸',
                cropOrSite: '葡萄',
                controlTarget: '调节生长',
                applicationMethod: '喷雾',
                validUntil: '2027-12-31'
            }
        ]);

        const ragSources = Vue.ref([
            { title: '2025年粮食作物重大病虫害防控技术方案', type: '防控方案', url: 'https://www.agri.cn/zx/zxfb/202502/t20250228_8715477.htm' },
            { title: '2025年园艺作物重大病虫害防控技术方案', type: '防控方案', url: 'https://www.agri.cn/zx/zxfb/202502/t20250228_8715479.htm' },
            { title: '2025年水稻“一喷多促”技术意见', type: '农事指导', url: 'https://www.agri.cn/sc/nszd/202508/t20250809_8758891.htm' },
            { title: '2025年全国早稻病虫害发生趋势预报', type: '病虫预报', url: 'https://www.agri.cn/sc/zxjc/zwbch/202506/t20250605_8738822.htm' },
            { title: '2024年我国农药登记情况及特点分析', type: '农药登记', url: 'https://www.chinapesticide.org.cn/zwb/detail/30474' },
            { title: '我国禁止和限制使用农药品种清单', type: '安全约束', url: 'https://www.chinapesticide.org.cn/kgls/detail/30477' }
        ]);

        const fallbackGraph = {
            nodes: [
                { id: 'weather', name: '高温高湿', type: 'WeatherFactor' },
                { id: 'disease', name: '病害风险', type: 'Disease' },
                { id: 'crop', name: '水稻', type: 'Crop' },
                { id: 'measure', name: '绿色防控', type: 'Measure' },
                { id: 'pesticide', name: '农药登记', type: 'Pesticide' }
            ],
            links: [
                { source: 'weather', target: 'disease', relationType: 'INCREASES_RISK_OF' },
                { source: 'crop', target: 'disease', relationType: 'HAS_DISEASE' },
                { source: 'disease', target: 'measure', relationType: 'CONTROLLED_BY' },
                { source: 'pesticide', target: 'measure', relationType: 'RELATED_TO' }
            ]
        };

        const formatValue = (value, unit) => {
            if (value === null || value === undefined || value === '') {
                return '--';
            }
            const number = Number(value);
            const text = Number.isFinite(number) ? number.toFixed(1) : value;
            return unit ? text + unit : text;
        };

        const loadWeather = async () => {
            if (!selectedCity.value) return;
            weatherLoading.value = true;
            weatherError.value = '';
            try {
                const cityName = selectedCity.value;
                const [decisionData, forecastData] = await Promise.all([
                    api.get('/api/weather/decision-input/by-city', { params: { cityName } }),
                    api.get('/api/weather/forecast/by-city', { params: { cityName } }).catch(() => ({ hourly: [] }))
                ]);
                weatherDecision.value = decisionData || {};
                forecast.value = forecastData || { hourly: [] };
            } catch (error) {
                weatherError.value = '天气接口暂不可用，请确认后端已启动并可访问 /api/weather。';
                forecast.value = { hourly: [] };
            } finally {
                weatherLoading.value = false;
                Vue.nextTick(renderForecastChart);
            }
        };

        const renderForecastChart = () => {
            if (!forecastChartRef.value || !window.echarts) {
                return;
            }
            if (!forecastChart) {
                forecastChart = echarts.init(forecastChartRef.value);
            }
            const hourly = (forecast.value.hourly || []).slice(0, 24);
            const labels = hourly.map(item => String(item.time || '').substring(11, 16) || String(item.time || '').substring(0, 10));
            const temperatures = hourly.map(item => item.temperature ?? null);
            const humidity = hourly.map(item => item.humidity ?? null);
            const precipitation = hourly.map(item => item.precipitation ?? null);
            forecastChart.setOption({
                tooltip: { trigger: 'axis' },
                legend: { top: 0, data: ['温度', '湿度', '降雨'] },
                grid: { top: 42, left: 42, right: 24, bottom: 36 },
                xAxis: { type: 'category', data: labels, boundaryGap: false },
                yAxis: [
                    { type: 'value', name: '温度/湿度' },
                    { type: 'value', name: '降雨', position: 'right' }
                ],
                series: [
                    { name: '温度', type: 'line', smooth: true, data: temperatures, itemStyle: { color: '#e6a23c' } },
                    { name: '湿度', type: 'line', smooth: true, data: humidity, itemStyle: { color: '#409eff' } },
                    { name: '降雨', type: 'bar', yAxisIndex: 1, data: precipitation, itemStyle: { color: '#67c23a' } }
                ]
            });
        };

        const normalizeGraph = (data) => {
            if (!data || !(data.nodes || []).length) {
                return fallbackGraph;
            }
            return {
                nodes: (data.nodes || []).map(node => ({
                    id: String(node.id),
                    name: node.name || node.zhPrefLabel || node.label || String(node.id),
                    type: node.type || node.label || 'Entity'
                })),
                links: (data.links || []).map(link => ({
                    source: String(link.source),
                    target: String(link.target),
                    relationType: link.relationType || link.type || 'RELATED_TO'
                }))
            };
        };

        const loadKnowledgeGraph = async () => {
            graphLoading.value = true;
            try {
                const params = {
                    query: '水稻 病虫害 防控',
                    crop: '水稻',
                    scenario: weatherDecision.value.agentInputText || '高温高湿条件下的病虫害防控'
                };
                const data = window.knowledgeGraphApi ? await window.knowledgeGraphApi.search(params) : fallbackGraph;
                renderKnowledgeGraph(normalizeGraph(data));
            } catch (error) {
                renderKnowledgeGraph(fallbackGraph);
            } finally {
                graphLoading.value = false;
            }
        };

        const renderKnowledgeGraph = (graph) => {
            if (!kgChartRef.value || !window.echarts) {
                return;
            }
            if (!kgChart) {
                kgChart = echarts.init(kgChartRef.value);
            }
            const types = [...new Set(graph.nodes.map(node => node.type))];
            const colors = {
                WeatherFactor: '#409eff',
                Crop: '#67c23a',
                Disease: '#f56c6c',
                Pest: '#e6a23c',
                Measure: '#909399',
                Pesticide: '#8e44ad',
                Entity: '#409eff'
            };
            kgChart.setOption({
                tooltip: {},
                legend: { top: 0, data: types },
                series: [{
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    draggable: true,
                    top: 38,
                    categories: types.map(type => ({ name: type })),
                    data: graph.nodes.map(node => ({
                        id: String(node.id),
                        name: node.name,
                        category: types.indexOf(node.type),
                        symbolSize: node.type === 'Pesticide' ? 58 : 48,
                        itemStyle: { color: colors[node.type] || '#409eff' },
                        label: { show: true, overflow: 'break', width: 112 }
                    })),
                    links: graph.links.map(link => ({
                        source: String(link.source),
                        target: String(link.target),
                        label: { show: true, formatter: link.relationType, fontSize: 10 },
                        lineStyle: { curveness: 0.16 }
                    })),
                    edgeSymbol: ['none', 'arrow'],
                    edgeSymbolSize: 8,
                    force: { repulsion: 320, edgeLength: 125 }
                }]
            });
        };

        Vue.onMounted(async () => {
            await loadWeather();
            await loadKnowledgeGraph();
            window.addEventListener('resize', resizeCharts);
        });

        Vue.onBeforeUnmount(() => {
            window.removeEventListener('resize', resizeCharts);
            forecastChart?.dispose();
            kgChart?.dispose();
        });

        const resizeCharts = () => {
            forecastChart?.resize();
            kgChart?.resize();
        };

        return {
            weatherLoading,
            graphLoading,
            weatherError,
            provinces,
            cities,
            selectedProvince,
            selectedCity,
            onProvinceChange,
            onCityChange,
            weatherDecision,
            forecastChartRef,
            kgChartRef,
            ragSources,
            pesticideRegistrations,
            formatValue,
            loadWeather,
            loadKnowledgeGraph
        };
    }
};
