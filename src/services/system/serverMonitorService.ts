import http from "@/api";

// 服务器监控快照
export interface ServerMonitorOverview {
	collectedAt: string;
	hostName: string;
	cpu: ServerCpu;
	memory: ServerMemory;
	disks: ServerDisk[];
	networks: ServerNetwork[];
	dotNetProcesses: DotNetProcess[];
}

// CPU信息
export interface ServerCpu {
	usagePercent: number;
	logicalProcessorCount: number;
}

// 内存信息
export interface ServerMemory {
	totalBytes: number;
	usedBytes: number;
	freeBytes: number;
	usagePercent: number;
}

// 磁盘信息
export interface ServerDisk {
	name: string;
	driveFormat: string;
	totalBytes: number;
	usedBytes: number;
	freeBytes: number;
	usagePercent: number;
}

// 网络信息
export interface ServerNetwork {
	name: string;
	description: string;
	status: string;
	receivedBytes: number;
	sentBytes: number;
}

// .NET进程信息
export interface DotNetProcess {
	processId: number;
	name: string;
	startTime?: string;
	cpuMilliseconds: number;
	workingSetBytes: number;
	threadCount: number;
	handleCount: number;
}

// 获取服务器监控快照
export const getServerMonitorOverview = async (): Promise<ServerMonitorOverview> => {
	const response = await http.get<ServerMonitorOverview>("/serverMonitor/overview", undefined, {
		headers: { noLoading: true }
	});
	return response.data!;
};
