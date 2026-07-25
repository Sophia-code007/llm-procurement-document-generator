$body = @{
    templateId = "template3"
    data = @{
        projectName = "宜昌市第三中学多媒体教学设备采购项目"
        budget = "120万元"
        deliveryDate = "2026-07-25"
        contactPerson = "吴政"
        contactPhone = "13800138000"
        deliveryLocation = "宜昌市第三中学"
        paymentTerms = "一次性付清"
        warrantyPeriod = "3年"
        evaluationMethod = "综合评分法"
    }
    outputType = "word"
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/documents/generate-from-template" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop

[System.IO.File]::WriteAllBytes("c:\Users\30915\Desktop\test_service_export.docx", $response)
Write-Host "文件已保存到桌面"