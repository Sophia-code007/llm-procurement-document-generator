// EXPORTS: IFileItem, MOCK_FILES
export interface IFileItem {
  id: string
  fileName: string
  fileType: 'bid' | 'contract'
  createdAt: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  riskLevel?: 'high' | 'medium' | 'low'
}

export const MOCK_FILES: IFileItem[] = [
  {
    id: '1',
    fileName: '2024年度服务器采购项目招标书',
    fileType: 'bid',
    createdAt: '2024-01-15 14:30',
    status: 'approved',
    riskLevel: 'low',
  },
  {
    id: '2',
    fileName: '办公设备采购合同',
    fileType: 'contract',
    createdAt: '2024-01-14 10:20',
    status: 'pending',
    riskLevel: 'medium',
  },
  {
    id: '3',
    fileName: '软件系统开发服务招标书',
    fileType: 'bid',
    createdAt: '2024-01-12 16:45',
    status: 'draft',
  },
  {
    id: '4',
    fileName: '园区物业管理服务合同',
    fileType: 'contract',
    createdAt: '2024-01-10 09:15',
    status: 'approved',
    riskLevel: 'low',
  },
  {
    id: '5',
    fileName: '实验室仪器设备采购招标书',
    fileType: 'bid',
    createdAt: '2024-01-08 11:30',
    status: 'rejected',
    riskLevel: 'high',
  },
]