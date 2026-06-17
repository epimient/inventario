import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from fastapi.responses import FileResponse
from app.repositories.inventario_repository import InventarioRepository
from datetime import datetime, date

class ReportService:
    def __init__(self):
        self.repo = InventarioRepository()
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "utils", "reporte_inventario.pdf")
        
        # Asegurar existencia del directorio base
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)

    def generar_reporte_unico_inventario(self) -> FileResponse:
        # 1. Recolección limpia y unificada de datos reales calculados
        lotes = self.repo.get_todos_los_lotes()
        hoy = date.today()
        
        doc = SimpleDocTemplate(self.output_path, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        story = []
        styles = getSampleStyleSheet()

        # Estilos Custom
        title_style = ParagraphStyle('ReportTitle', parent=styles['Heading1'], fontSize=22, textColor=colors.HexColor('#1A252C'), spaceAfter=15)
        meta_style = ParagraphStyle('ReportMeta', parent=styles['Normal'], fontSize=10, textColor=colors.gray, spaceAfter=20)
        
        # Encabezado Principal del Documento
        story.append(Paragraph("REPORTE CENTRAL DE INVENTARIO INTELIGENTE", title_style))
        story.append(Paragraph(f"Fecha de Ejecución Automatizada: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')} | Estado Global del Servidor: Operativo", meta_style))
        story.append(Spacer(1, 10))

        # Estructurar Datos en la Matriz del PDF
        table_data = [["ID Lote", "Producto", "Categoría", "Stock Físico", "Vencimiento", "Condición"]]
        
        for lote in lotes:
            fv = datetime.strptime(lote["fecha_vencimiento"], "%Y-%m-%d").date()
            dias = (fv - hoy).days
            condicion = "VENCIDO" if dias <= 0 else f"Crítico ({dias}d)" if dias <= 15 else "Estable"

            table_data.append([
                f"#{lote['id']}",
                lote["productos"]["nombre"],
                lote["productos"]["categorias"]["nombre"],
                str(lote["cantidad"]),
                lote["fecha_vencimiento"],
                condicion
            ])

        # Construcción Estilizada de la Tabla
        t = Table(table_data, colWidths=[50, 150, 120, 70, 80, 80])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2C3E50')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8F9FA')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]))
        
        story.append(t)
        doc.build(story)

        # Retornar Archivo Físico Sobreescrito (Headers de no-cache para asegurar datos frescos)
        return FileResponse(
            self.output_path, 
            media_type="application/pdf", 
            filename="Reporte_Inventario_SmartStock.pdf",
            headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
        )