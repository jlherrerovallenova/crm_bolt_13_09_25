import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import * as XLSX from 'xlsx'

interface ImportResult {
  success: number
  errors: number
  details: Array<{
    row: number
    error: string
    data: any
  }>
}

export function Importar() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()
  const { toast } = useToast()

  const canImport = profile?.role && ['admin', 'gestor'].includes(profile.role)

  const generateTemplate = () => {
    const template = [
      {
        'Portal': '1',
        'Planta': '0',
        'Letra': 'A',
        'Tipología': 'Piso',
        'Orientación': 'S',
        'Dormitorios': 2,
        'Superficie Útil + Terraza': 85.5,
        'Superficie Útil Vivienda': 70.0,
        'Superficie Útil Terrazas': 15.5,
        'PVP Final': 225000,
        'Observaciones': '',
        'Estado': 'LIBRE',
        'Gestor': 'Juan L. Herrero',
        'Último Responsable': ''
      }
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(template)
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla')
    XLSX.writeFile(wb, 'plantilla_viviendas_lubens_farnesio.xlsx')

    toast({
      title: "Plantilla descargada",
      description: "Se ha descargado la plantilla Excel",
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: "Solo se permiten archivos Excel (.xlsx, .xls) o CSV",
      })
      return
    }

    setFile(selectedFile)
    previewFile(selectedFile)
  }

  const previewFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      setPreviewData(jsonData.slice(0, 5)) // Mostrar solo las primeras 5 filas
      setImportResult(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar el archivo",
      })
    }
  }

  const validateRow = (row: any, index: number) => {
    const errors = []

    // Validar campos obligatorios
    if (!row.Portal) errors.push('Portal es obligatorio')
    if (!row.Planta) errors.push('Planta es obligatoria')
    if (!row.Letra) errors.push('Letra es obligatoria')

    // Validar estado
    const validStates = ['LIBRE', 'BLOQUEADA', 'RESERVADA']
    if (row.Estado && !validStates.includes(row.Estado)) {
      errors.push(`Estado debe ser uno de: ${validStates.join(', ')}`)
    }

    // Validar números
    if (row.Dormitorios && isNaN(Number(row.Dormitorios))) {
      errors.push('Dormitorios debe ser un número')
    }

    // Validar superficies y precio
    const numberFields = ['Superficie Útil + Terraza', 'Superficie Útil Vivienda', 'Superficie Útil Terrazas', 'PVP Final']
    numberFields.forEach(field => {
      if (row[field] && isNaN(Number(row[field]))) {
        errors.push(`${field} debe ser un número`)
      }
    })

    return errors
  }

  const handleImport = async () => {
    if (!file || !canImport) return

    setImporting(true)
    setProgress(0)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      let successCount = 0
      let errorCount = 0
      const errorDetails: ImportResult['details'] = []

      // Cargar personas para mapeo
      const { data: personas } = await supabase
        .from('personas')
        .select('id, nombre')

      const personaMap = new Map(personas?.map(p => [p.nombre, p.id]) || [])

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        const rowIndex = i + 2 // +2 porque Excel empieza en 1 y hay header

        // Validar fila
        const validationErrors = validateRow(row, i)
        if (validationErrors.length > 0) {
          errorCount++
          errorDetails.push({
            row: rowIndex,
            error: validationErrors.join(', '),
            data: row
          })
          continue
        }

        try {
          // Mapear gestor y responsable
          const gestorId = row.Gestor ? personaMap.get(row.Gestor) : null
          const responsableId = row['Último Responsable'] ? personaMap.get(row['Último Responsable']) : null

          const viviendaData = {
            portal: row.Portal,
            planta: row.Planta,
            letra: row.Letra,
            tipologia: row.Tipología || null,
            orientacion: row.Orientación || null,
            dormitorios: row.Dormitorios ? Number(row.Dormitorios) : null,
            sup_util_terraza: row['Superficie Útil + Terraza'] ? Number(row['Superficie Útil + Terraza']) : null,
            sup_util_vivienda: row['Superficie Útil Vivienda'] ? Number(row['Superficie Útil Vivienda']) : null,
            sup_util_terrazas: row['Superficie Útil Terrazas'] ? Number(row['Superficie Útil Terrazas']) : null,
            pvp_final: row['PVP Final'] ? Number(row['PVP Final']) : null,
            observaciones: row.Observaciones || null,
            estado: row.Estado || 'LIBRE',
            gestor_id: gestorId,
            responsable_id: responsableId
          }

          // Upsert por codigo_unique
          const { error } = await supabase
            .from('viviendas')
            .upsert(viviendaData, { onConflict: 'codigo_unique' })

          if (error) throw error
          successCount++
        } catch (error: any) {
          errorCount++
          errorDetails.push({
            row: rowIndex,
            error: error.message,
            data: row
          })
        }

        // Actualizar progreso
        setProgress(((i + 1) / jsonData.length) * 100)
      }

      // Registrar job de importación
      await supabase
        .from('import_jobs')
        .insert({
          filename: file.name,
          status: errorCount > 0 ? 'ERROR' : 'OK',
          total_rows: jsonData.length,
          ok_rows: successCount,
          error_rows: errorCount,
          log: { errors: errorDetails }
        })

      setImportResult({
        success: successCount,
        errors: errorCount,
        details: errorDetails
      })

      toast({
        title: "Importación completada",
        description: `${successCount} registros importados correctamente, ${errorCount} errores`,
      })

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en importación",
        description: error.message,
      })
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Importar Viviendas</h2>
          <p className="text-gray-600">Importa el inventario desde archivos Excel o CSV</p>
        </div>

        {!canImport && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para importar. Solo administradores y gestores pueden realizar importaciones.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Descargar Plantilla</span>
              </CardTitle>
              <CardDescription>
                Descarga la plantilla Excel con el formato correcto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generateTemplate} className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar plantilla.xlsx
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Subir Archivo</span>
              </CardTitle>
              <CardDescription>
                Arrastra tu archivo aquí o haz clic para seleccionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : 'Selecciona un archivo'}
                </p>
                <p className="text-sm text-gray-500">
                  Archivos Excel (.xlsx, .xls) o CSV
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {previewData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previsualización</CardTitle>
              <CardDescription>
                Primeras 5 filas del archivo (total: {previewData.length}+ filas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key} className="text-left p-2 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="p-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {canImport && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleImport}
                    disabled={importing || !file}
                    className="flex items-center space-x-2"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Importando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Importar Datos</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {importing && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso de importación</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {importResult.errors === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <span>Resultado de Importación</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {importResult.success}
                    </p>
                    <p className="text-sm text-green-800">Exitosos</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {importResult.errors}
                    </p>
                    <p className="text-sm text-red-800">Errores</p>
                  </div>
                </div>

                {importResult.details.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Errores detallados:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {importResult.details.map((detail, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-red-800">Fila {detail.row}</p>
                              <p className="text-sm text-red-600">{detail.error}</p>
                            </div>
                            <Badge variant="destructive" className="text-xs">Error</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}