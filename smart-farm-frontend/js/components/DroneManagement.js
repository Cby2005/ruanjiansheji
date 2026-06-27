const DroneManagement = {
    template: `
        <div style="max-width: 1500px; margin: 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                    <h2 style="margin:0; color:#1f2937; font-size:22px;">温室无人机巡检</h2>
                    <div style="margin-top:6px; color:#6b7280; font-size:13px;">设备、航点、路径、任务、识别与报告闭环管理</div>
                </div>
                <el-button :icon="Refresh" circle title="刷新" @click="loadAll"></el-button>
            </div>

            <div style="background:#fff; border:1px solid #e5e7eb; padding:0 18px 18px;">
                <el-tabs v-model="activeTab" @tab-change="changeTab">
                    <el-tab-pane label="无人机设备" name="devices">
                        <div style="display:flex; gap:10px; margin-bottom:14px;">
                            <el-input v-model="filters.deviceKeyword" placeholder="编号或名称" clearable style="width:220px" @keyup.enter="loadDevices"></el-input>
                            <el-select v-model="filters.deviceStatus" placeholder="全部状态" clearable style="width:150px" @change="loadDevices">
                                <el-option v-for="s in ['IDLE','RUNNING','FAULT','MAINTENANCE']" :key="s" :label="statusText(s)" :value="s"></el-option>
                            </el-select>
                            <el-button :icon="Search" @click="loadDevices">查询</el-button>
                            <el-button v-if="canEdit" type="primary" :icon="Plus" @click="editDevice()">新增设备</el-button>
                        </div>
                        <el-table :data="devices" border stripe>
                            <el-table-column prop="droneCode" label="设备编号" min-width="120"></el-table-column>
                            <el-table-column prop="droneName" label="设备名称" min-width="130"></el-table-column>
                            <el-table-column prop="model" label="型号" min-width="110"></el-table-column>
                            <el-table-column label="电量" width="150">
                                <template #default="{row}"><el-progress :percentage="row.batteryLevel || 0" :stroke-width="10"></el-progress></template>
                            </el-table-column>
                            <el-table-column label="运行状态" width="110"><template #default="{row}"><el-tag :type="tagType(row.status)">{{ statusText(row.status) }}</el-tag></template></el-table-column>
                            <el-table-column prop="cameraStatus" label="相机" width="90"></el-table-column>
                            <el-table-column label="当前位置" min-width="150"><template #default="{row}">{{ row.currentX }}, {{ row.currentY }}, {{ row.currentZ }}</template></el-table-column>
                            <el-table-column v-if="canEdit" label="操作" width="150" fixed="right">
                                <template #default="{row}"><el-button link type="primary" @click="editDevice(row)">编辑</el-button><el-button link type="danger" @click="remove('device', row.id)">删除</el-button></template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="巡检点位" name="points">
                        <div style="display:flex; gap:10px; margin-bottom:14px;">
                            <el-input v-model="filters.areaName" placeholder="区域名称" clearable style="width:200px" @keyup.enter="loadPoints"></el-input>
                            <el-select v-model="filters.pointType" placeholder="全部类型" clearable style="width:150px" @change="loadPoints">
                                <el-option v-for="t in pointTypes" :key="t.value" :label="t.label" :value="t.value"></el-option>
                            </el-select>
                            <el-button :icon="Search" @click="loadPoints">查询</el-button>
                            <el-button v-if="canEdit" type="primary" :icon="Plus" @click="editPoint()">新增点位</el-button>
                        </div>
                        <el-table :data="points" border stripe>
                            <el-table-column prop="pointName" label="点位名称" min-width="150"></el-table-column>
                            <el-table-column prop="areaName" label="温室区域" min-width="120"></el-table-column>
                            <el-table-column prop="greenhouseId" label="温室ID" width="90"></el-table-column>
                            <el-table-column label="经纬度" min-width="200"><template #default="{row}">{{row.longitude}}, {{row.latitude}} / {{row.altitude}}m</template></el-table-column>
                            <el-table-column label="类型" width="110"><template #default="{row}"><el-tag :type="pointTag(row.pointType)">{{pointTypeText(row.pointType)}}</el-tag></template></el-table-column>
                            <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
                            <el-table-column v-if="canEdit" label="操作" width="150" fixed="right"><template #default="{row}"><el-button link type="primary" @click="editPoint(row)">编辑</el-button><el-button link type="danger" @click="remove('point', row.id)">删除</el-button></template></el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="路径规划" name="routes">
                        <el-form :inline="true" :model="routeForm" label-position="top" style="padding:4px 0 12px;">
                            <el-form-item label="路径名称"><el-input v-model="routeForm.routeName" style="width:180px"></el-input></el-form-item>
                            <el-form-item label="巡检点（按选择顺序）"><el-select v-model="routeForm.pointIds" multiple collapse-tags style="width:300px"><el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.id"></el-option></el-select></el-form-item>
                            <el-form-item label="规划方式"><el-segmented v-model="routeForm.algorithmType" :options="routeAlgorithms"></el-segmented></el-form-item>
                            <el-form-item label="起点 X/Y/Z"><div style="display:flex; gap:4px"><el-input-number v-model="routeForm.startX" :controls="false" style="width:70px"></el-input-number><el-input-number v-model="routeForm.startY" :controls="false" style="width:70px"></el-input-number><el-input-number v-model="routeForm.startZ" :controls="false" style="width:70px"></el-input-number></div></el-form-item>
                            <el-form-item label="终点 X/Y/Z"><div style="display:flex; gap:4px"><el-input-number v-model="routeForm.endX" :controls="false" style="width:70px"></el-input-number><el-input-number v-model="routeForm.endY" :controls="false" style="width:70px"></el-input-number><el-input-number v-model="routeForm.endZ" :controls="false" style="width:70px"></el-input-number></div></el-form-item>
                            <el-form-item label=" "><el-button type="primary" :icon="Position" :loading="saving" @click="generateRoute">生成路径</el-button></el-form-item>
                        </el-form>
                        <div v-if="routePreview.length" style="height:240px; background:#f8faf9; border:1px solid #dce7df; margin-bottom:14px; position:relative;">
                            <svg viewBox="0 0 560 240" style="width:100%; height:100%">
                                <polyline :points="routePolyline" fill="none" stroke="#16a34a" stroke-width="3" stroke-linejoin="round"></polyline>
                                <g v-for="(p,i) in routePreview" :key="i"><circle :cx="p.sx" :cy="p.sy" r="6" :fill="i === 0 ? '#2563eb' : (i === routePreview.length-1 ? '#dc2626' : '#16a34a')"></circle><text :x="p.sx+8" :y="p.sy-8" font-size="11" fill="#374151">{{p.name}}</text></g>
                            </svg>
                        </div>
                        <el-table :data="routes" border stripe @row-click="previewRoute">
                            <el-table-column prop="routeCode" label="路径编号" min-width="130"></el-table-column><el-table-column prop="routeName" label="路径名称" min-width="140"></el-table-column>
                            <el-table-column prop="routeType" label="类型" width="150"></el-table-column><el-table-column prop="totalDistance" label="距离(m)" width="100"></el-table-column><el-table-column prop="estimatedTime" label="预计(秒)" width="110"></el-table-column>
                            <el-table-column label="点位" min-width="180"><template #default="{row}">{{ waypointCount(row) }} 个巡检点</template></el-table-column>
                            <el-table-column v-if="canEdit" label="操作" width="90"><template #default="{row}"><el-button link type="danger" @click.stop="remove('route', row.id)">删除</el-button></template></el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="路径可视化" name="map">
                        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; padding:4px 0 14px;">
                            <el-select v-model="mapForm.greenhouseId" style="width:150px"><el-option label="1号草莓温室" :value="1"></el-option></el-select>
                            <el-select v-model="mapForm.routeType" style="width:170px"><el-option label="日常巡检" value="DAILY_INSPECTION"></el-option><el-option label="病害巡检" value="DISEASE_INSPECTION"></el-option><el-option label="异常复核" value="ABNORMAL_RECHECK"></el-option></el-select>
                            <el-select v-model="mapForm.algorithmType" style="width:130px"><el-option label="按顺序" value="ORDER"></el-option><el-option label="最近邻" value="NEAREST"></el-option></el-select>
                            <el-select v-model="mapForm.pointIds" multiple collapse-tags placeholder="选择航点" style="width:240px"><el-option v-for="p in mapPoints" :key="p.id" :label="p.pointName" :value="p.id"></el-option></el-select>
                            <el-button :icon="Refresh" @click="loadMapPoints">加载巡检点</el-button>
                            <el-button v-if="canEdit" @click="initMapPoints">初始化默认点位</el-button>
                            <el-button type="primary" :icon="Position" :loading="saving" @click="generateMapRoute">生成路径</el-button>
                            <el-button type="success" :icon="VideoPlay" :disabled="!mapRoute" @click="simulateFlight">模拟飞行</el-button>
                            <el-button :icon="Delete" @click="clearMapRoute">清除路径</el-button>
                            <span style="margin-left:auto; color:#64748b; font-size:13px;">中心：[{{mapCenter.latitude}}, {{mapCenter.longitude}}]</span>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:start;">
                            <div id="drone-route-map" style="height:650px; min-width:0; flex:1 1 720px; border:1px solid #d8e5dc; background:#edf5ef;"></div>
                            <div style="border-left:3px solid #16a34a; padding:4px 0 0 16px; min-height:650px; flex:1 1 280px; max-width:360px;">
                                <h3 style="margin:0 0 16px; font-size:16px; color:#1f2937;">路径信息</h3>
                                <el-descriptions :column="1" border size="small">
                                    <el-descriptions-item label="路径名称">{{mapRoute?.routeName || '-'}}</el-descriptions-item>
                                    <el-descriptions-item label="巡检点数">{{mapWaypoints.length}}</el-descriptions-item>
                                    <el-descriptions-item label="总距离">{{mapRoute ? mapRoute.totalDistance + ' m' : '-'}}</el-descriptions-item>
                                    <el-descriptions-item label="预计耗时">{{mapRoute ? mapRoute.estimatedTime + ' 秒' : '-'}}</el-descriptions-item>
                                    <el-descriptions-item label="无人机状态"><el-tag :type="mapStatus==='模拟飞行中'?'primary':'success'">{{mapStatus}}</el-tag></el-descriptions-item>
                                </el-descriptions>
                                <el-table :data="mapWaypoints" size="small" border style="margin-top:14px" max-height="420">
                                    <el-table-column prop="orderIndex" label="#" width="44"></el-table-column>
                                    <el-table-column prop="pointName" label="航点"></el-table-column>
                                    <el-table-column label="类型" width="82"><template #default="{row}">{{pointTypeText(row.pointType)}}</template></el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="巡检任务" name="tasks">
                        <el-form :inline="true" :model="taskForm" style="margin-bottom:10px">
                            <el-form-item><el-input v-model="taskForm.taskName" placeholder="任务名称" style="width:180px"></el-input></el-form-item>
                            <el-form-item><el-select v-model="taskForm.droneId" placeholder="选择无人机" style="width:180px"><el-option v-for="d in devices" :key="d.id" :label="d.droneName + ' (' + statusText(d.status) + ')'" :value="d.id"></el-option></el-select></el-form-item>
                            <el-form-item><el-select v-model="taskForm.routeId" placeholder="选择路径" style="width:180px"><el-option v-for="r in routes" :key="r.id" :label="r.routeName" :value="r.id"></el-option></el-select></el-form-item>
                            <el-form-item><el-button v-if="canEdit" type="primary" :icon="Plus" @click="createTask">创建任务</el-button></el-form-item>
                        </el-form>
                        <el-table :data="tasks" border stripe>
                            <el-table-column prop="taskCode" label="任务编号" min-width="130"></el-table-column><el-table-column prop="taskName" label="任务名称" min-width="150"></el-table-column><el-table-column prop="droneId" label="设备ID" width="85"></el-table-column><el-table-column prop="routeId" label="路径ID" width="85"></el-table-column>
                            <el-table-column label="状态" width="105"><template #default="{row}"><el-tag :type="tagType(row.taskStatus)">{{statusText(row.taskStatus)}}</el-tag></template></el-table-column><el-table-column prop="startTime" label="开始时间" min-width="155"></el-table-column><el-table-column prop="endTime" label="结束时间" min-width="155"></el-table-column>
                            <el-table-column v-if="canEdit" label="任务控制" width="210" fixed="right"><template #default="{row}"><el-button v-if="row.taskStatus==='PENDING'" link type="success" @click="taskAction('start',row.id)">开始</el-button><el-button v-if="row.taskStatus==='RUNNING'" link type="primary" @click="taskAction('finish',row.id)">完成</el-button><el-button v-if="['PENDING','RUNNING'].includes(row.taskStatus)" link type="danger" @click="taskAction('cancel',row.id)">取消</el-button></template></el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="巡检影像" name="images">
                        <el-form :inline="true" :model="imageForm" style="margin-bottom:10px">
                            <el-form-item><el-select v-model="imageForm.taskId" placeholder="关联任务" style="width:210px"><el-option v-for="t in tasks" :key="t.id" :label="t.taskName" :value="t.id"></el-option></el-select></el-form-item>
                            <el-form-item><el-input v-model="imageForm.imageUrl" placeholder="影像 URL" style="width:300px"></el-input></el-form-item>
                            <el-form-item><el-input v-model="imageForm.capturePoint" placeholder="拍摄点" style="width:130px"></el-input></el-form-item>
                            <el-form-item><el-button v-if="canEdit" type="primary" :icon="Upload" @click="addImage">登记影像</el-button></el-form-item>
                        </el-form>
                        <el-table :data="images" border stripe>
                            <el-table-column label="预览" width="90"><template #default="{row}"><el-image :src="row.imageUrl" :preview-src-list="[row.imageUrl]" fit="cover" style="width:56px;height:42px"></el-image></template></el-table-column><el-table-column prop="taskId" label="任务ID" width="85"></el-table-column><el-table-column prop="capturePoint" label="拍摄点" min-width="120"></el-table-column>
                            <el-table-column label="识别状态" width="105"><template #default="{row}"><el-tag :type="row.detectResult==='DISEASE'?'danger':(row.detectResult==='HEALTHY'?'success':'info')">{{row.detectResult}}</el-tag></template></el-table-column><el-table-column prop="diseaseType" label="病害类型" min-width="120"></el-table-column><el-table-column label="置信度" width="100"><template #default="{row}">{{row.confidence ? Math.round(row.confidence*100)+'%' : '-'}}</template></el-table-column><el-table-column prop="suggestion" label="处置建议" min-width="200"></el-table-column>
                            <el-table-column v-if="canEdit" label="操作" width="100"><template #default="{row}"><el-button link type="primary" :disabled="row.detectResult!=='PENDING'" @click="detectImage(row.id)">智能识别</el-button></template></el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="巡检报告" name="reports">
                        <div style="display:flex; gap:10px; margin-bottom:14px;"><el-select v-model="reportTaskId" placeholder="选择已巡检任务" style="width:260px"><el-option v-for="t in tasks" :key="t.id" :label="t.taskName + ' (' + statusText(t.taskStatus) + ')'" :value="t.id"></el-option></el-select><el-button v-if="canEdit" type="primary" :icon="Document" @click="generateReport">生成/更新报告</el-button></div>
                        <el-table :data="reports" border stripe>
                            <el-table-column prop="taskName" label="任务" min-width="150"></el-table-column><el-table-column prop="droneName" label="无人机" min-width="130"></el-table-column><el-table-column prop="routeName" label="路径" min-width="130"></el-table-column><el-table-column prop="inspectionArea" label="区域" min-width="110"></el-table-column><el-table-column prop="totalImages" label="影像数" width="80"></el-table-column>
                            <el-table-column label="异常" width="80"><template #default="{row}"><el-tag :type="row.abnormalImages ? 'danger':'success'">{{row.abnormalImages}}</el-tag></template></el-table-column><el-table-column prop="diseaseTypes" label="病害" min-width="130"></el-table-column><el-table-column prop="suggestion" label="综合建议" min-width="220"></el-table-column>
                            <el-table-column v-if="canEdit" label="联动" width="130"><template #default="{row}"><el-button link type="primary" :disabled="!row.abnormalImages" @click="createFarmTask(row.taskId)">生成农事任务</el-button></template></el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
            </div>

            <el-dialog v-model="deviceDialog" :title="deviceForm.id ? '编辑无人机' : '新增无人机'" width="540px">
                <el-form :model="deviceForm" label-width="90px"><el-form-item label="设备编号"><el-input v-model="deviceForm.droneCode"></el-input></el-form-item><el-form-item label="设备名称"><el-input v-model="deviceForm.droneName"></el-input></el-form-item><el-form-item label="型号"><el-input v-model="deviceForm.model"></el-input></el-form-item><el-form-item label="电量"><el-slider v-model="deviceForm.batteryLevel" show-input></el-slider></el-form-item><el-form-item label="温室ID"><el-input-number v-model="deviceForm.greenhouseId" :min="1"></el-input-number></el-form-item><el-form-item label="备注"><el-input v-model="deviceForm.remark" type="textarea"></el-input></el-form-item></el-form>
                <template #footer><el-button @click="deviceDialog=false">取消</el-button><el-button type="primary" @click="saveDevice">保存</el-button></template>
            </el-dialog>
            <el-dialog v-model="pointDialog" :title="pointForm.id ? '编辑巡检点' : '新增巡检点'" width="540px">
                <el-form :model="pointForm" label-width="90px"><el-form-item label="点位名称"><el-input v-model="pointForm.pointName"></el-input></el-form-item><el-form-item label="温室区域"><el-input v-model="pointForm.areaName"></el-input></el-form-item><el-form-item label="温室ID"><el-input-number v-model="pointForm.greenhouseId" :min="1"></el-input-number></el-form-item><el-form-item label="经度/纬度"><div style="display:flex; gap:8px"><el-input-number v-model="pointForm.longitude" :precision="6" :controls="false" style="width:170px"></el-input-number><el-input-number v-model="pointForm.latitude" :precision="6" :controls="false" style="width:170px"></el-input-number></div></el-form-item><el-form-item label="飞行高度"><el-input-number v-model="pointForm.altitude" :precision="2" :min="0.5" :max="20"></el-input-number></el-form-item><el-form-item label="类型"><el-select v-model="pointForm.pointType" style="width:180px"><el-option v-for="t in pointTypes" :key="t.value" :label="t.label" :value="t.value"></el-option></el-select></el-form-item><el-form-item label="备注"><el-input v-model="pointForm.remark"></el-input></el-form-item></el-form>
                <template #footer><el-button @click="pointDialog=false">取消</el-button><el-button type="primary" @click="savePoint">保存</el-button></template>
            </el-dialog>
        </div>
    `,

    setup() {
        const route = VueRouter.useRoute();
        const router = VueRouter.useRouter();
        const message = ElementPlus.ElMessage;
        const activeTab = Vue.ref(route.query.tab || 'devices');
        const devices = Vue.ref([]), points = Vue.ref([]), routes = Vue.ref([]), tasks = Vue.ref([]), images = Vue.ref([]), reports = Vue.ref([]);
        const deviceDialog = Vue.ref(false), pointDialog = Vue.ref(false), saving = Vue.ref(false), reportTaskId = Vue.ref(null);
        const mapPoints = Vue.ref([]), mapRoute = Vue.ref(null), mapStatus = Vue.ref('待规划');
        const mapCenter = Vue.reactive({ latitude:34.136323, longitude:113.809058 });
        const filters = Vue.reactive({ deviceKeyword:'', deviceStatus:'', areaName:'', pointType:'' });
        const blankDevice = () => ({ droneCode:'', droneName:'', model:'UAV-X1', batteryLevel:100, greenhouseId:1, status:'IDLE', cameraStatus:'NORMAL', currentX:0, currentY:0, currentZ:0, remark:'' });
        const blankPoint = () => ({ pointName:'', greenhouseId:1, areaName:'A区', x:0, y:0, z:1.5, longitude:113.809058, latitude:34.136323, altitude:1.5, pointType:'NORMAL', remark:'' });
        const deviceForm = Vue.reactive(blankDevice()), pointForm = Vue.reactive(blankPoint());
        const routeForm = Vue.reactive({ routeName:'草莓温室日常巡检', greenhouseId:1, routeType:'DAILY_INSPECTION', pointIds:[], algorithmType:'NEAREST', startX:0, startY:0, startZ:2, endX:0, endY:0, endZ:2 });
        const mapForm = Vue.reactive({ greenhouseId:1, routeName:'1号温室草莓日常巡检路线', routeType:'DAILY_INSPECTION', algorithmType:'NEAREST', pointIds:[] });
        const taskForm = Vue.reactive({ taskName:'草莓温室巡检任务', droneId:null, routeId:null, greenhouseId:1, taskType:'DAILY' });
        const imageForm = Vue.reactive({ taskId:null, imageUrl:'', capturePoint:'' });
        const selectedRoute = Vue.ref(null);
        const pageContent = (value) => value?.content || [];
        const canEdit = Vue.computed(() => (JSON.parse(localStorage.getItem('user') || '{}').role || 'VIEWER') !== 'VIEWER');
        const routeAlgorithms = [{ label:'按顺序', value:'ORDER' }, { label:'最近邻', value:'NEAREST' }];
        const pointTypes = [{label:'起飞点',value:'START'},{label:'普通巡检点',value:'NORMAL'},{label:'异常复核点',value:'ABNORMAL'},{label:'返航点',value:'END'}];
        let leafletMap, pointLayer, routeLayer, droneMarker, flightTimer;
        const run = async (action, success) => { try { saving.value=true; await action(); if(success) message.success(success); } catch(e) { message.error(e.message || '操作失败'); } finally { saving.value=false; } };
        const loadDevices = async () => devices.value = pageContent(await droneApi.devices({ keyword:filters.deviceKeyword || undefined, status:filters.deviceStatus || undefined }));
        const loadPoints = async () => points.value = pageContent(await droneApi.points({ areaName:filters.areaName || undefined, pointType:filters.pointType || undefined }));
        const loadRoutes = async () => routes.value = pageContent(await droneApi.routes());
        const loadTasks = async () => tasks.value = pageContent(await droneApi.tasks());
        const loadImages = async () => images.value = pageContent(await droneApi.images());
        const loadReports = async () => reports.value = pageContent(await droneApi.reports());
        const loadAll = async () => { try { await Promise.all([loadDevices(),loadPoints(),loadRoutes(),loadTasks(),loadImages(),loadReports()]); } catch(e) { message.error(e.message || '无人机数据加载失败'); } };
        const changeTab = name => router.replace({ path:'/drones', query:{ tab:name } });
        Vue.watch(() => route.query.tab, async value => { activeTab.value = value || 'devices'; if(value === 'map') await loadMapPoints(); });
        const editDevice = row => { Object.assign(deviceForm, blankDevice(), row || {}); deviceDialog.value=true; };
        const editPoint = row => { Object.assign(pointForm, blankPoint(), row || {}); pointDialog.value=true; };
        const saveDevice = () => run(async () => { if(!deviceForm.droneCode || !deviceForm.droneName) throw new Error('请填写设备编号和名称'); await droneApi.saveDevice({...deviceForm}); deviceDialog.value=false; await loadDevices(); }, '设备已保存');
        const savePoint = () => run(async () => { if(!pointForm.pointName) throw new Error('请填写点位名称'); await droneApi.savePoint({...pointForm}); pointDialog.value=false; await loadPoints(); }, '点位已保存');
        const remove = async (type,id) => { try { await ElementPlus.ElMessageBox.confirm('确认删除这条记录？','删除确认',{type:'warning'}); await ({device:droneApi.deleteDevice,point:droneApi.deletePoint,route:droneApi.deleteRoute}[type])(id); await loadAll(); message.success('已删除'); } catch(e) { if(e !== 'cancel' && e !== 'close') message.error(e.message || '删除失败'); } };
        const generateRoute = () => run(async () => { if(!routeForm.routeName || routeForm.pointIds.length<2) throw new Error('请填写路径名称并至少选择2个巡检点'); selectedRoute.value = await droneApi.generateRoute({...routeForm}); await loadRoutes(); }, '路径已生成');
        const createTask = () => run(async () => { if(!taskForm.taskName || !taskForm.droneId || !taskForm.routeId) throw new Error('请填写任务并选择设备和路径'); await droneApi.createTask({...taskForm}); await loadTasks(); }, '任务已创建');
        const taskAction = (action,id) => run(async () => { await ({start:droneApi.startTask,finish:droneApi.finishTask,cancel:droneApi.cancelTask}[action])(id); await Promise.all([loadTasks(),loadDevices()]); }, '任务状态已更新');
        const addImage = () => run(async () => { if(!imageForm.taskId || !imageForm.imageUrl) throw new Error('请选择任务并填写影像 URL'); await droneApi.addImage({...imageForm}); imageForm.imageUrl=''; imageForm.capturePoint=''; await loadImages(); }, '影像已登记');
        const detectImage = id => run(async () => { await droneApi.detectImage(id); await loadImages(); }, '识别完成');
        const generateReport = () => run(async () => { if(!reportTaskId.value) throw new Error('请选择巡检任务'); await droneApi.generateReport(reportTaskId.value); await loadReports(); }, '报告已生成');
        const createFarmTask = id => run(() => droneApi.createFarmTask(id), '已生成农事处置任务');
        const previewRoute = row => selectedRoute.value=row;
        const parsedWaypoints = row => { if(Array.isArray(row?.waypoints)) return row.waypoints; try { return JSON.parse(row?.waypoints || '[]'); } catch { return []; } };
        const waypointCount = row => parsedWaypoints(row).length;
        const routePreview = Vue.computed(() => {
            if(!selectedRoute.value) return [];
            const raw=parsedWaypoints(selectedRoute.value).map(p=>({...p,name:p.pointName}));
            const xs=raw.map(p=>Number(p.longitude ?? p.x)||0), ys=raw.map(p=>Number(p.latitude ?? p.y)||0), minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
            return raw.map(p=>({...p,sx:30+((Number(p.longitude ?? p.x)||0)-minX)/(maxX-minX||1)*500,sy:210-((Number(p.latitude ?? p.y)||0)-minY)/(maxY-minY||1)*180}));
        });
        const routePolyline = Vue.computed(() => routePreview.value.map(p=>p.sx+','+p.sy).join(' '));
        const mapWaypoints = Vue.computed(() => parsedWaypoints(mapRoute.value));
        const escapeHtml = value => String(value ?? '-').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
        const initLeafletMap = async () => {
            await Vue.nextTick();
            const element=document.getElementById('drone-route-map');
            if(!element) return;
            if(typeof L === 'undefined') throw new Error('Leaflet 地图资源加载失败');
            if(leafletMap){ leafletMap.invalidateSize(); return; }
            leafletMap=L.map(element).setView([34.136323,113.809058],19);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:21,attribution:'&copy; OpenStreetMap'}).addTo(leafletMap);
            L.polygon([[34.136250,113.808950],[34.136560,113.808950],[34.136560,113.809430],[34.136250,113.809430]],{color:'#16a34a',weight:2,fillColor:'#86efac',fillOpacity:0.22}).bindPopup('1号温室草莓种植区').addTo(leafletMap);
            pointLayer=L.layerGroup().addTo(leafletMap);
            leafletMap.on('moveend',()=>{const c=leafletMap.getCenter();mapCenter.latitude=c.lat.toFixed(6);mapCenter.longitude=c.lng.toFixed(6);});
        };
        const renderMapPoints = () => {
            if(!leafletMap || !pointLayer) return;
            pointLayer.clearLayers();
            const colors={START:'#16a34a',NORMAL:'#2563eb',ABNORMAL:'#dc2626',END:'#6b7280'};
            mapPoints.value.filter(p=>p.latitude!=null&&p.longitude!=null).forEach(p=>{
                const marker=L.circleMarker([p.latitude,p.longitude],{radius:p.pointType==='START'?9:7,color:'#fff',weight:2,fillColor:colors[p.pointType]||'#2563eb',fillOpacity:1});
                marker.bindPopup(`<b>${escapeHtml(p.pointName)}</b><br>类型：${escapeHtml(pointTypeText(p.pointType))}<br>区域：${escapeHtml(p.areaName)}<br>经度：${p.longitude}<br>纬度：${p.latitude}<br>高度：${p.altitude ?? 1.5} m<br>备注：${escapeHtml(p.remark)}`);
                marker.addTo(pointLayer);
            });
        };
        const loadMapPoints = async () => {
            try {
                await initLeafletMap();
                mapPoints.value=pageContent(await droneApi.points({greenhouseId:mapForm.greenhouseId,size:100})).sort((a,b)=>a.id-b.id);
                mapForm.pointIds=mapPoints.value.filter(p=>p.latitude!=null&&p.longitude!=null).map(p=>p.id);
                renderMapPoints();
                if(!mapForm.pointIds.length) message.warning('暂无经纬度点位，请初始化默认点位');
            } catch(e) { message.error(e.message || '地图点位加载失败'); }
        };
        const initMapPoints = () => run(async()=>{await droneApi.initPoints();await Promise.all([loadPoints(),loadMapPoints()]);},'默认点位已初始化');
        const drawMapRoute = async () => {
            await initLeafletMap();
            const latLngs=mapWaypoints.value.map(p=>[p.latitude,p.longitude]);
            if(latLngs.length<2) return;
            if(routeLayer) leafletMap.removeLayer(routeLayer);
            if(droneMarker) leafletMap.removeLayer(droneMarker);
            routeLayer=L.polyline(latLngs,{color:'#2563eb',weight:5,opacity:0.9}).addTo(leafletMap);
            droneMarker=L.marker(latLngs[0],{icon:L.divIcon({className:'',html:'<div style="width:32px;height:32px;border-radius:50%;background:#fff;color:#16a34a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #475569"><i class="fas fa-helicopter"></i></div>',iconSize:[32,32],iconAnchor:[16,16]})}).bindTooltip('巡检无人机').addTo(leafletMap);
            leafletMap.fitBounds(routeLayer.getBounds(),{padding:[35,35]});
            mapStatus.value='路径已生成';
        };
        const generateMapRoute = () => run(async()=>{
            if(mapForm.pointIds.length<2) throw new Error('至少需要2个巡检点');
            mapRoute.value=await droneApi.generateRoute({...mapForm});
            await drawMapRoute();
            await loadRoutes();
        },'真实经纬度路径已生成');
        const clearMapRoute = () => {
            if(flightTimer) clearInterval(flightTimer);
            if(leafletMap&&routeLayer) leafletMap.removeLayer(routeLayer);
            if(leafletMap&&droneMarker) leafletMap.removeLayer(droneMarker);
            flightTimer=routeLayer=droneMarker=null; mapRoute.value=null; mapStatus.value='待规划';
        };
        const simulateFlight = () => {
            const points=mapWaypoints.value.map(p=>[p.latitude,p.longitude]);
            if(!droneMarker||points.length<2) return message.warning('请先生成路径');
            if(flightTimer) clearInterval(flightTimer);
            let index=0; droneMarker.setLatLng(points[0]); mapStatus.value='模拟飞行中';
            flightTimer=setInterval(()=>{index++;if(index>=points.length){clearInterval(flightTimer);flightTimer=null;mapStatus.value='模拟完成';message.success('巡检任务模拟完成');return;}droneMarker.setLatLng(points[index]);leafletMap.panTo(points[index]);},1000);
        };
        const pointTypeText = type => ({START:'起飞点',NORMAL:'巡检点',ABNORMAL:'异常复核',END:'返航点',KEY:'重点点',DISEASE_PRONE:'易病点'}[type]||type||'-');
        const pointTag = type => ({START:'success',NORMAL:'primary',ABNORMAL:'danger',END:'info'}[type]||'warning');
        const statusText = s => ({IDLE:'空闲',RUNNING:'运行中',FAULT:'故障',MAINTENANCE:'维护中',PENDING:'待执行',FINISHED:'已完成',CANCELLED:'已取消'}[s] || s || '-');
        const tagType = s => ({IDLE:'success',RUNNING:'primary',FAULT:'danger',MAINTENANCE:'warning',PENDING:'info',FINISHED:'success',CANCELLED:'info'}[s] || 'info');
        Vue.onMounted(async()=>{await loadAll();if(activeTab.value==='map')await loadMapPoints();});
        Vue.onBeforeUnmount(()=>{if(flightTimer)clearInterval(flightTimer);if(leafletMap)leafletMap.remove();});
        return { activeTab,devices,points,routes,tasks,images,reports,mapPoints,filters,deviceDialog,pointDialog,deviceForm,pointForm,routeForm,taskForm,imageForm,reportTaskId,saving,canEdit,routeAlgorithms,pointTypes,routePreview,routePolyline,mapForm,mapRoute,mapWaypoints,mapStatus,mapCenter,loadAll,loadDevices,loadPoints,loadMapPoints,initMapPoints,generateMapRoute,simulateFlight,clearMapRoute,changeTab,editDevice,editPoint,saveDevice,savePoint,remove,generateRoute,createTask,taskAction,addImage,detectImage,generateReport,createFarmTask,previewRoute,waypointCount,pointTypeText,pointTag,statusText,tagType,Math,
            Refresh:ElementPlusIconsVue.Refresh, Search:ElementPlusIconsVue.Search, Plus:ElementPlusIconsVue.Plus, Position:ElementPlusIconsVue.Position, Upload:ElementPlusIconsVue.Upload, Document:ElementPlusIconsVue.Document, VideoPlay:ElementPlusIconsVue.VideoPlay, Delete:ElementPlusIconsVue.Delete };
    }
};
