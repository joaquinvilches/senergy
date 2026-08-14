# -*- coding: utf-8 -*-
"""Genera la propuesta de financiamiento SENERGY para la Municipalidad de El Monte."""
import docx
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

CONFIDENCIAL = (
    "DOCUMENTO CONFIDENCIAL — Prohibida su reproducción, distribución o divulgación total o "
    "parcial sin autorización expresa y por escrito del autor. Este documento se entrega "
    "exclusivamente para fines de evaluación de la postulación al financiamiento municipal "
    "indicado. © 2026 SENERGY. Todos los derechos reservados."
)

AZUL = RGBColor(0x1B, 0x3A, 0x5C)
GRIS = RGBColor(0x55, 0x55, 0x55)


def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)


def add_confidential_box(doc, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, "F2F2F2")
    p = cell.paragraphs[0]
    run = p.add_run(text)
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = GRIS
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    return table


def add_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = AZUL
    return h


def add_bullets(doc, items):
    for item in items:
        doc.add_paragraph(item, style='List Bullet')


def set_footer(doc, text):
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    p.text = ""
    run = p.add_run(text)
    run.font.size = Pt(7.5)
    run.font.color.rgb = GRIS
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER


def build():
    doc = docx.Document()

    # Márgenes
    for section in doc.sections:
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.top_margin = Cm(2)
        section.bottom_margin = Cm(2)

    set_footer(doc, CONFIDENCIAL)

    # --- Portada ---
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("SENERGY")
    run.bold = True
    run.font.size = Pt(40)
    run.font.color.rgb = AZUL

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run("Propuesta de Financiamiento")
    run.font.size = Pt(20)
    run.font.color.rgb = GRIS

    subtitle2 = doc.add_paragraph()
    subtitle2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle2.add_run("Presentada a la Ilustre Municipalidad de El Monte")
    run.font.size = Pt(14)

    doc.add_paragraph()
    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = meta.add_run("Julio 2026")
    run.font.size = Pt(11)

    presentado = doc.add_paragraph()
    presentado.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = presentado.add_run("Presentado por: [TU NOMBRE COMPLETO]")
    run.font.size = Pt(11)

    contacto = doc.add_paragraph()
    contacto.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = contacto.add_run("Contacto: [correo de contacto]  |  [teléfono de contacto]")
    run.font.size = Pt(11)

    doc.add_paragraph()
    add_confidential_box(doc, CONFIDENCIAL)
    doc.add_page_break()

    # --- 1. Resumen ejecutivo ---
    add_heading(doc, "1. Resumen Ejecutivo")
    doc.add_paragraph(
        "SENERGY es una aplicación móvil que permite a las personas entender y controlar su "
        "gasto eléctrico antes de que llegue la boleta: registran su consumo, ven una "
        "estimación del costo según la tarifa de su distribuidora, definen un presupuesto "
        "mensual y reciben alertas cuando el consumo se dispara. Está pensada especialmente "
        "para quienes administran más de un medidor — familias con más de una propiedad, "
        "arrendadores y pequeños emprendedores — un grupo que hoy no tiene ninguna "
        "herramienta simple para llevar ese control en un solo lugar."
    )
    doc.add_paragraph(
        "Buscamos financiamiento por un monto de $10.000.000 a $15.000.000 CLP, destinado "
        "a contratar apoyo de desarrollo y a invertir en publicidad para hacer crecer la base "
        "de usuarios en Chile. El objetivo de mediano plazo es validar el modelo localmente y, "
        "si los resultados lo justifican, expandir SENERGY a otros países."
    )

    # --- 2. El problema ---
    add_heading(doc, "2. El Problema")
    doc.add_paragraph(
        "La mayoría de las familias chilenas no tiene visibilidad de cuánto están gastando en "
        "electricidad hasta que llega la boleta, momento en el que ya es tarde para ajustar el "
        "consumo del mes. El problema se agrava para quienes deben controlar más de un "
        "medidor — por ejemplo, una familia con una segunda vivienda o una pieza en "
        "arriendo — ya que hoy no existe una forma simple de centralizar esa información en "
        "un solo lugar, independiente de la distribuidora eléctrica de cada propiedad."
    )

    # --- 3. La solución ---
    add_heading(doc, "3. La Solución: SENERGY")
    doc.add_paragraph(
        "SENERGY resuelve este problema con una aplicación simple, disponible hoy para "
        "Android, que ofrece:"
    )
    add_bullets(doc, [
        "Registro rápido de lecturas del medidor, con respaldo fotográfico.",
        "Estimación automática del costo en pesos según la tarifa vigente de tu distribuidora.",
        "Presupuesto mensual y alertas tempranas cuando el consumo se proyecta por sobre lo esperado.",
        "Soporte para múltiples medidores y propiedades desde una sola cuenta.",
        "Historial personal de incidentes eléctricos (cortes, variaciones de tensión).",
    ])
    doc.add_paragraph(
        "Por tratarse de un documento de acceso público, este resumen describe la propuesta "
        "de valor a nivel funcional; los detalles de implementación técnica se comparten "
        "directamente con evaluadores del financiamiento que lo requieran, bajo los resguardos "
        "de confidencialidad correspondientes."
    )

    # --- 4. Estado actual ---
    add_heading(doc, "4. Estado Actual del Proyecto")
    add_bullets(doc, [
        "[ESTADO DE PUBLICACIÓN: completar — ej. app en etapa final de pruebas / publicada en Google Play]",
        "Modelo de monetización ya implementado: plan gratuito con publicidad y plan Premium por suscripción mensual.",
        "Infraestructura en la nube (Firebase) operativa y preparada para escalar en número de usuarios.",
        "Desarrollo realizado hasta la fecha íntegramente con recursos propios, sin financiamiento externo.",
    ])

    # --- 5. Oportunidad de mercado ---
    add_heading(doc, "5. Oportunidad de Mercado")
    doc.add_paragraph(
        "Todo hogar con suministro eléctrico regulado en Chile es un usuario potencial. Es un "
        "nicho real: no se identificaron aplicaciones activas enfocadas específicamente en el "
        "mercado chileno que combinen múltiples medidores, tarifas por región/distribuidora y "
        "presupuesto personal en una sola herramienta. La oportunidad de SENERGY está en "
        "ofrecer, en un solo lugar, lo que hoy una persona con más de una propiedad solo "
        "puede obtener consultando por separado cada distribuidora."
    )

    # --- 6. Modelo de negocio ---
    add_heading(doc, "6. Modelo de Negocio")
    doc.add_paragraph(
        "Modelo freemium con dos fuentes de ingreso: publicidad para el plan gratuito y una "
        "suscripción Premium mensual que la elimina y desbloquea funciones adicionales. El "
        "cobro se procesa a través de Google Play Billing / RevenueCat, sin necesidad de "
        "manejar pagos directamente."
    )

    # --- 7. Uso de los fondos ---
    add_heading(doc, "7. Uso de los Fondos Solicitados")
    doc.add_paragraph("Monto solicitado: $10.000.000 – $15.000.000 CLP")
    table = doc.add_table(rows=1, cols=2)
    table.style = 'Light Grid Accent 1'
    hdr = table.rows[0].cells
    hdr[0].text = "Destino"
    hdr[1].text = "Detalle"
    filas = [
        ("Contratación de desarrollo", "Apoyo de programación para nuevas funcionalidades, estabilidad y expansión a nuevas plataformas."),
        ("Publicidad y adquisición de usuarios", "Campañas digitales para crecer la base de usuarios en Chile."),
        ("[Otro / reserva operativa]", "[completar si aplica]"),
    ]
    for a, b in filas:
        row = table.add_row().cells
        row[0].text = a
        row[1].text = b

    # --- 8. Visión de expansión ---
    add_heading(doc, "8. Visión de Expansión")
    doc.add_paragraph(
        "Si los resultados en Chile validan el modelo, el objetivo es adaptar SENERGY a otros "
        "mercados, replicando la misma lógica de tarifas locales y presupuesto personal que hoy "
        "funciona para el mercado chileno."
    )

    # --- 9. Impacto para la comuna ---
    add_heading(doc, "9. Impacto para la Comuna de El Monte")
    add_bullets(doc, [
        "[Completar: contratación de personas de la comuna, si aplica]",
        "[Completar: vínculo del proyecto con El Monte — origen del equipo, domicilio, u otro]",
        "Posicionar a la comuna como origen de un emprendimiento tecnológico con proyección nacional.",
    ])

    # --- 10. Equipo ---
    add_heading(doc, "10. Equipo")
    doc.add_paragraph("[TU NOMBRE COMPLETO] — Fundador, desarrollo y producto. [Breve trayectoria/motivación.]")

    # --- 11. Solicitud y próximos pasos ---
    add_heading(doc, "11. Solicitud y Próximos Pasos")
    doc.add_paragraph(
        "Se solicita evaluar un financiamiento de $10.000.000 a $15.000.000 CLP bajo la "
        "modalidad que corresponda según los instrumentos disponibles en la Municipalidad de "
        "El Monte. Quedamos disponibles para presentar una demostración funcional de la "
        "aplicación y responder cualquier consulta del equipo evaluador."
    )

    doc.add_paragraph()
    add_confidential_box(doc, CONFIDENCIAL)

    out_path = "SENERGY_Propuesta_Financiamiento_Municipalidad_El_Monte.docx"
    doc.save(out_path)
    print("OK:", out_path)


if __name__ == "__main__":
    build()
