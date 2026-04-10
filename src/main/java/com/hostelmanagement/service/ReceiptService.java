package com.hostelmanagement.service;

import com.hostelmanagement.model.Payment;
import com.hostelmanagement.repository.PaymentRepository;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptService {
    private static final String HOSTEL_NAME = "Hostel Management System";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final PaymentRepository paymentRepository;

    public ReceiptService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public byte[] generateReceipt(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfDocument pdf = new PdfDocument(new PdfWriter(outputStream));
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(48, 48, 48, 48);

            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            DeviceRgb accent = new DeviceRgb(37, 99, 235);
            DeviceRgb soft = new DeviceRgb(238, 244, 255);

            document.add(new Paragraph(HOSTEL_NAME)
                    .setFont(bold)
                    .setFontSize(24)
                    .setFontColor(accent)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Official Payment Receipt")
                    .setFont(regular)
                    .setFontSize(13)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(24));

            Table table = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                    .useAllAvailableWidth()
                    .setBorder(new SolidBorder(new DeviceRgb(220, 227, 238), 1));

            addRow(table, "Student Name", payment.getStudent().getName(), soft, bold, regular);
            addRow(table, "Payment ID", "#" + payment.getId(), soft, bold, regular);
            addRow(table, "Bill ID", "#" + payment.getBill().getId(), soft, bold, regular);
            addRow(table, "Amount", "INR " + payment.getAmount(), soft, bold, regular);
            addRow(table, "Date", payment.getPaidAt().format(DATE_FORMAT), soft, bold, regular);
            addRow(table, "Status", payment.getBill().getStatus().name(), soft, bold, regular);
            document.add(table);

            document.add(new Paragraph("Thank you. This receipt confirms successful hostel fee payment.")
                    .setFont(regular)
                    .setFontSize(11)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(28));

            document.close();
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new BusinessException("Could not generate receipt");
        }
    }

    private void addRow(Table table, String label, String value, DeviceRgb labelBackground, PdfFont bold, PdfFont regular) {
        table.addCell(new Cell()
                .add(new Paragraph(label).setFont(bold))
                .setBackgroundColor(labelBackground)
                .setPadding(12)
                .setBorder(new SolidBorder(new DeviceRgb(220, 227, 238), 1)));
        table.addCell(new Cell()
                .add(new Paragraph(value).setFont(regular))
                .setPadding(12)
                .setBorder(new SolidBorder(new DeviceRgb(220, 227, 238), 1)));
    }
}
