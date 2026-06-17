
#ayuda general que cualquiera puede usar 
#en cualquier momento ej formateadores de fechas,
# generadores de códigos automáticos o manejadores de texto
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from datetime import datetime, date

class PDFGenerator:
    @staticmethod
    def generar_pdf_inventario(datos_lotes: list, output_path: str):
        """
        Motor de renderizado PDF. Recibe datos crudos y una ruta de salida,
        y genera el documento físico aplicando los estilos visuales.
        """
        # Asegurar existencia del directorio base
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        hoy = date.today()
        doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        story = []
        styles = getSampleStyleSheet()

        # Estilos Custom
        title_style = ParagraphStyle('ReportTitle', parent=styles['Heading1'], fontSize=22, textColor=colors.HexColor('#1A252C'), spaceAfter=15)
        meta_style = ParagraphStyle('ReportMeta', parent=styles['Normal'], fontSize=10, textColor=colors.gray, spaceAfter=20)
        
        # Encabezado Principal del Documento
        story.append(Paragraph("REPORTE CENTRAL DE INVENTARIO INTELIGENTE", title_style))
        story.append(Paragraph(f"Fecha de Ejecución Automatizada: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", meta_style))
        story.append(Spacer(1, 10))

        # Estructurar Datos en la Matriz del PDF
        table_data = [["ID Lote", "Producto", "Categoría", "Stock Físico", "Vencimiento", "Condición"]]
        
        for lote in datos_lotes:
            # Parsear fecha de YYYY-MM-DD a objeto date
            fv = datetime.strptime(lote["fecha_vencimiento"], "%Y-%m-%d").date()
            dias = (fv - hoy).days
            
            # Lógica de presentación visual
            condicion = "VENCIDO" if dias <= 0 else f"Crítico ({dias}d)" if dias <= 15 else "Estable"

            # Extraer datos anidados de la consulta de Supabase
            nombre_producto = lote.get("productos", {}).get("nombre", "N/A")
            nombre_categoria = lote.get("productos", {}).get("categorias", {}).get("nombre", "N/A")

            table_data.append([
                f"#{lote['id']}",
                nombre_producto,
                nombre_categoria,
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
        
        return output_path