package com.institution.bonafide.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.*;
import com.institution.bonafide.entity.CertificateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    @Autowired
    private QrCodeGeneratorService qrCodeGeneratorService;

    @Value("${bonafide.app.institutionName:Government Polytechnic Miraj}")
    private String institutionName;

    @Value("${bonafide.app.institutionAddress:Mazi Sainik Vasahat Miraj MIDC, Miraj 416-410}")
    private String institutionAddress;

    @Value("${bonafide.app.verificationBaseUrl:http://localhost:8080/verify?certNo=}")
    private String verificationBaseUrl;

    public byte[] generateCertificatePdf(CertificateRequest req) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();

        // Border Decorative Box
        PdfContentByte cb = writer.getDirectContent();
        cb.setColorStroke(new Color(24, 43, 73));
        cb.setLineWidth(2.5f);
        cb.rectangle(20, 20, PageSize.A4.getWidth() - 40, PageSize.A4.getHeight() - 40);
        cb.stroke();

        cb.setColorStroke(new Color(197, 160, 89));
        cb.setLineWidth(1.0f);
        cb.rectangle(24, 24, PageSize.A4.getWidth() - 48, PageSize.A4.getHeight() - 48);
        cb.stroke();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(24, 43, 73));
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        Font certHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(197, 160, 89));
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
        Font smallItalic = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);

        // Header Table
        Paragraph pHead = new Paragraph(institutionName.toUpperCase(), titleFont);
        pHead.setAlignment(Element.ALIGN_CENTER);
        document.add(pHead);

        Paragraph pAddress = new Paragraph(institutionAddress, subTitleFont);
        pAddress.setAlignment(Element.ALIGN_CENTER);
        document.add(pAddress);

        document.add(Chunk.NEWLINE);

        // Horizontal Line
        Paragraph line = new Paragraph("________________________________________________________________________", subTitleFont);
        line.setAlignment(Element.ALIGN_CENTER);
        document.add(line);

        document.add(Chunk.NEWLINE);

        // Reference Number and Date
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String issueDateStr = req.getIssuedAt() != null ? req.getIssuedAt().format(formatter) : LocalDateTime.now().format(formatter);

        PdfPCell cellRef = new PdfPCell(new Phrase("Ref No: " + req.getCertificateNumber(), boldFont));
        cellRef.setBorder(Rectangle.NO_BORDER);

        PdfPCell cellDate = new PdfPCell(new Phrase("Date: " + issueDateStr, boldFont));
        cellDate.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellDate.setBorder(Rectangle.NO_BORDER);

        metaTable.addCell(cellRef);
        metaTable.addCell(cellDate);
        document.add(metaTable);

        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Certificate Title Banner
        Paragraph certTitle = new Paragraph(req.getCertificateType().getTitle().toUpperCase(), certHeaderFont);
        certTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(certTitle);

        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Certificate Body Paragraph
        Paragraph body = new Paragraph();
        body.setLeading(22.0f);
        body.add(new Chunk("This is to certify that Mr. / Ms. ", bodyFont));
        body.add(new Chunk(req.getStudent().getName().toUpperCase(), boldFont));
        body.add(new Chunk(" bearing Roll No ", bodyFont));
        body.add(new Chunk(req.getStudent().getUsername(), boldFont));
        body.add(new Chunk(" is a bonafide student of ", bodyFont));
        body.add(new Chunk(institutionName, boldFont));
        body.add(new Chunk(", studying in ", bodyFont));
        body.add(new Chunk(req.getStudent().getAcademicYear(), boldFont));
        body.add(new Chunk(" in the Department of ", bodyFont));
        body.add(new Chunk(req.getStudent().getDepartment(), boldFont));
        body.add(new Chunk(".\n\nThis certificate is issued upon student's request for the purpose of: ", bodyFont));
        body.add(new Chunk(req.getPurpose() + ".", boldFont));

        document.add(body);

        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Footer Table (2 Columns: Left = QR Code, Right = Official Stamp & Principal Signature Image)
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{35f, 65f});

        // 1. Left Column: QR Code & Hash
        String verificationUrl = verificationBaseUrl + req.getCertificateNumber();
        byte[] qrBytes = qrCodeGeneratorService.generateQrCodeImage(verificationUrl, 100, 100);
        Image qrImg = Image.getInstance(qrBytes);
        
        PdfPCell qrCell = new PdfPCell();
        qrCell.setBorder(Rectangle.NO_BORDER);
        qrCell.addElement(qrImg);
        qrCell.addElement(new Paragraph("Scan to Verify Authenticity", smallItalic));
        qrCell.addElement(new Paragraph("Doc ID: " + req.getQrVerificationHash().substring(0, 12) + "...", smallItalic));

        // 2. Right Column: Actual Scanned Institutional Stamp & Principal Signature Image
        PdfPCell stampSigCell = new PdfPCell();
        stampSigCell.setBorder(Rectangle.NO_BORDER);
        stampSigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        InputStream imgStream = getClass().getResourceAsStream("/images/official_stamp_signature.png");
        if (imgStream != null) {
            byte[] imgBytes = imgStream.readAllBytes();
            Image stampSigImg = Image.getInstance(imgBytes);
            stampSigImg.scaleToFit(280, 100);
            stampSigImg.setAlignment(Element.ALIGN_RIGHT);
            stampSigCell.addElement(stampSigImg);
        }

        footerTable.addCell(qrCell);
        footerTable.addCell(stampSigCell);

        document.add(footerTable);

        document.close();
        return out.toByteArray();
    }
}
