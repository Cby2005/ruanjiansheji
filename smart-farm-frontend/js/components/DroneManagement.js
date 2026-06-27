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
                                <el-option label="普通点" value="NORMAL"></el-option><el-option label="重点点" value="KEY"></el-option>
                            </el-select>
                            <el-button :icon="Search" @click="loadPoints">查询</el-button>
                            <el-button v-if="canEdit" type="primary" :icon="Plus" @click="editPoint()">新增点位</el-button>
                        </div>
                        <el-table :data="points" border stripe>
                            <el-table-column prop="pointName" label="点位名称" min-width="150"></el-table-column>
                            <el-table-column prop="areaName" label="温室区域" min-width="120"></el-table-column>
                            <el-table-column prop="greenhouseId" label="温室ID" width="90"></el-table-column>
                            <el-table-column label="坐标 (m)" min-width="160"><template #default="{row}">X {{row.x}} / Y {{row.y}} / Z {{row.z}}</template></el-table-column>
                            <el-table-column label="类型" width="100"><template #default="{row}"><el-tag :type="row.pointType === 'KEY' ? 'warning' : 'info'">{{row.pointType === 'KEY' ? '重点点' : '普通点'}}</el-tag></template></el-table-column>
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
                            <el-table-column prop="routeType" label="类型" width="100"></el-table-column><el-table-column prop="totalDistance" label="距离(m)" width="100"></el-table-column><el-table-column prop="estimatedTime" label="预计(min)" width="110"></el-table-column>
                            <el-table-column label="点位" min-width="180"><template #default="{row}">{{ waypointCount(row) }} 个巡检点</template></el-table-column>
                            <el-table-column v-if="canEdit" label="操作" width="90"><template #default="{row}"><el-button link type="danger" @click.stop="remove('route', row.id)">删除</el-button></template></el-table-column>
                        </el-table>
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
                <el-form :model="pointForm" label-width="90px"><el-form-item label="点位名称"><el-input v-model="pointForm.pointName"></el-input></el-form-item><el-form-item label="温室区域"><el-input v-model="pointForm.areaName"></el-input></el-form-item><el-form-item label="温室ID"><el-input-number v-model="pointForm.greenhouseId" :min="1"></el-input-number></el-form-item><el-form-item label="坐标 X/Y/Z"><div style="display:flex; gap:8px"><el-input-number v-model="pointForm.x" :controls="false" style="width:110px"></el-input-number><el-input-number v-model="pointForm.y" :controls="false" style="width:110px"></el-input-number><el-input-number v-model="pointForm.z" :controls="false" style="width:110px"></el-input-number></div></el-form-item><el-form-item label="类型"><el-radio-group v-model="pointForm.pointType"><el-radio-button label="NORMAL">普通点</el-radio-button><el-radio-button label="KEY">重点点</el-radio-button></el-radio-group></el-form-item><el-form-item label="备注"><el-input v-model="pointForm.remark"></el-input></el-form-item></el-form>
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
        const filters = Vue.reactive({ deviceKeyword:'', deviceStatus:'', areaName:'', pointType:'' });
        const blankDevice = () => ({ droneCode:'', droneName:'', model:'UAV-X1', batteryLevel:100, greenhouseId:1, status:'IDLE', cameraStatus:'NORMAL', currentX:0, currentY:0, currentZ:0, remark:'' });
        const blankPoint = () => ({ pointName:'', greenhouseId:1, areaName:'A区', x:0, y:0, z:2, pointType:'NORMAL', remark:'' });
        const deviceForm = Vue.reactive(blankDevice()), pointForm = Vue.reactive(blankPoint());
        const routeForm = Vue.reactive({ routeName:'草莓温室日常巡检', greenhouseId:1, routeType:'DAILY', pointIds:[], algorithmType:'NEAREST', startX:0, startY:0, startZ:2, endX:0, endY:0, endZ:2 });
        const taskForm = Vue.reactive({ taskName:'草莓温室巡检任务', droneId:null, routeId:null, greenhouseId:1, taskType:'DAILY' });
        const imageForm = Vue.reactive({ taskId:null, imageUrl:'', capturePoint:'' });
        const selectedRoute = Vue.ref(null);
        const pageContent = (value) => value?.content || [];
        const canEdit = Vue.computed(() => (JSON.parse(localStorage.getItem('user') || '{}').role || 'VIEWER') !== 'VIEWER');
        const routeAlgorithms = [{ label:'按顺序', value:'ORDER' }, { label:'最近邻', value:'NEAREST' }];
        const run = async (action, success) => { try { saving.value=true; await action(); if(success) message.success(success); } catch(e) { message.error(e.message || '操作失败'); } finally { saving.value=false; } };
        const loadDevices = async () => devices.value = pageContent(await droneApi.devices({ keyword:filters.deviceKeyword || undefined, status:filters.deviceStatus || undefined }));
        const loadPoints = async () => points.value = pageContent(await droneApi.points({ areaName:filters.areaName || undefined, pointType:filters.pointType || undefined }));
        const loadRoutes = async () => routes.value = pageContent(await droneApi.routes());
        const loadTasks = async () => tasks.value = pageContent(await droneApi.tasks());
        const loadImages = async () => images.value = pageContent(await droneApi.images());
        const loadReports = async () => reports.value = pageContent(await droneApi.reports());
        const loadAll = async () => { try { await Promise.all([loadDevices(),loadPoints(),loadRoutes(),loadTasks(),loadImages(),loadReports()]); } catch(e) { message.error(e.message || '无人机数据加载失败'); } };
        const changeTab = name => router.replace({ path:'/drones', query:{ tab:name } });
        Vue.watch(() => route.query.tab, value => activeTab.value = value || 'devices');
        const editDevice = row => { Object.assign(deviceForm, blankDevice(), row || {}); deviceDialog.value=true; };
        const editPoint = row => { Object.assign(pointForm, blankPoint(), row || {}); pointDialog.value=true; };
        const saveDevice = () => run(async () => { if(!deviceForm.droneCode || !deviceForm.droneName) throw new Error('请填写设备编号和名称'); await droneApi.saveDevice({...deviceForm}); deviceDialog.value=false; await loadDevices(); }, '设备已保存');
        const savePoint = () => run(async () => { if(!pointForm.pointName) throw new Error('请填写点位名称'); await droneApi.savePoint({...pointForm}); pointDialog.value=false; await loadPoints(); }, '点位已保存');
        const remove = async (type,id) => { try { await ElementPlus.ElMessageBox.confirm('确认删除这条记录？','删除确认',{type:'warning'}); await ({device:droneApi.deleteDevice,point:droneApi.deletePoint,route:droneApi.deleteRoute}[type])(id); await loadAll(); message.success('已删除'); } catch(e) { if(e !== 'cancel' && e !== 'close') message.error(e.message || '删除失败'); } };
        const generateRoute = () => run(async () => { if(!routeForm.routeName || !routeForm.pointIds.length) throw new Error('请填写路径名称并选择巡检点'); selectedRoute.value = await droneApi.generateRoute({...routeForm}); await loadRoutes(); }, '路径已生成');
        const createTask = () => run(async () => { if(!taskForm.taskName || !taskForm.droneId || !taskForm.routeId) throw new Error('请填写任务并选择设备和路径'); await droneApi.createTask({...taskForm}); await loadTasks(); }, '任务已创建');
        const taskAction = (action,id) => run(async () => { await ({start:droneApi.startTask,finish:droneApi.finishTask,cancel:droneApi.cancelTask}[action])(id); await Promise.all([loadTasks(),loadDevices()]); }, '任务状态已更新');
        const addImage = () => run(async () => { if(!imageForm.taskId || !imageForm.imageUrl) throw new Error('请选择任务并填写影像 URL'); await droneApi.addImage({...imageForm}); imageForm.imageUrl=''; imageForm.capturePoint=''; await loadImages(); }, '影像已登记');
        const detectImage = id => run(async () => { await droneApi.detectImage(id); await loadImages(); }, '识别完成');
        const generateReport = () => run(async () => { if(!reportTaskId.value) throw new Error('请选择巡检任务'); await droneApi.generateReport(reportTaskId.value); await loadReports(); }, '报告已生成');
        const createFarmTask = id => run(() => droneApi.createFarmTask(id), '已生成农事处置任务');
        const previewRoute = row => selectedRoute.value=row;
        const parsedWaypoints = row => { try { return JSON.parse(row?.waypoints || '[]'); } catch { return []; } };
        const waypointCount = row => parsedWaypoints(row).length;
        const routePreview = Vue.computed(() => {
            if(!selectedRoute.value) return [];
            const parse = value => { try { return JSON.parse(value || '{}'); } catch { return {}; } };
            const start=parse(selectedRoute.value.startPoint), end=parse(selectedRoute.value.endPoint);
            const raw=[{...start,name:'起点'},...parsedWaypoints(selectedRoute.value).map(p=>({...p,name:p.pointName})),{...end,name:'终点'}];
            const xs=raw.map(p=>Number(p.x)||0), ys=raw.map(p=>Number(p.y)||0), minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
            return raw.map(p=>({...p,sx:30+((Number(p.x)||0)-minX)/(maxX-minX||1)*500,sy:210-((Number(p.y)||0)-minY)/(maxY-minY||1)*180}));
        });
        const routePolyline = Vue.computed(() => routePreview.value.map(p=>p.sx+','+p.sy).join(' '));
        const statusText = s => ({IDLE:'空闲',RUNNING:'运行中',FAULT:'故障',MAINTENANCE:'维护中',PENDING:'待执行',FINISHED:'已完成',CANCELLED:'已取消'}[s] || s || '-');
        const tagType = s => ({IDLE:'success',RUNNING:'primary',FAULT:'danger',MAINTENANCE:'warning',PENDING:'info',FINISHED:'success',CANCELLED:'info'}[s] || 'info');
        Vue.onMounted(loadAll);
        return { activeTab,devices,points,routes,tasks,images,reports,filters,deviceDialog,pointDialog,deviceForm,pointForm,routeForm,taskForm,imageForm,reportTaskId,saving,canEdit,routeAlgorithms,routePreview,routePolyline,loadAll,loadDevices,loadPoints,changeTab,editDevice,editPoint,saveDevice,savePoint,remove,generateRoute,createTask,taskAction,addImage,detectImage,generateReport,createFarmTask,previewRoute,waypointCount,statusText,tagType,Math,
            Refresh:ElementPlusIconsVue.Refresh, Search:ElementPlusIconsVue.Search, Plus:ElementPlusIconsVue.Plus, Position:ElementPlusIconsVue.Position, Upload:ElementPlusIconsVue.Upload, Document:ElementPlusIconsVue.Document };
    }
};
