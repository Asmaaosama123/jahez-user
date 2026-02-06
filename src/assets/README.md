# AI Team (Fast API) - Detailed API Documentation

This document specifies the interface for the AI microservice to be consumed by the website backend.

## 1. Grading Endpoint: `/mcq`

### Purpose and Description
Processes student exam papers (Images or PDFs) and calculates scores based on a teacher-defined configuration (ROIs and Answer Key). This endpoint is **stateless**; it does not store internal model state and requires the configuration to be sent with every request.

### HTTP Method and URL
- **Method:** `POST`
- **URL:** `/mcq`

### Request Format
- **Headers:** `Content-Type: multipart/form-data`
- **Parameters:**
    - `files`: (Required) One or more files (`UploadFile`). Supports `.jpg`, `.png`, and `.pdf`.
    - `model_config`: (Required) A JSON string containing the teacher's model definition (Canvas size, Question ROIs, and Answer Keys).

#### Body Structure (`model_config` Example)
```json
{
  "canvas": {
    "width": 555,
    "height": 786
  },
  "questions": [
    {
      "id": "1",
      "type": "mcq",
      "answer": "C",
      "roi": [24, 193, 500, 53],
      "rois": {
        "A": [24, 193, 125, 53],
        "B": [149, 193, 125, 53],
        "C": [274, 193, 125, 53],
        "D": [399, 193, 125, 53]
      }
    },
    {
      "id": "4",
      "type": "true_false",
      "answer": "TRUE",
      "roi": [23, 458, 507, 32],
      "rois": {
        "FALSE": [23, 458, 253, 32],
        "TRUE": [276, 458, 253, 32]
      }
    }
  ]
}
```

---

## 2. Explanation of `model_config` Properties

The `model_config` JSON describes how the AI should look at the exam paper.

### Canvas Object
- **`width` & `height`**: The original dimensions of the image used when the teacher defined the ROIs. The AI uses these to scale coordinates if the uploaded student image has a different size.

### Questions Array
Each object in the `questions` array represents one question:
- **`id`**: A unique identifier for the question (e.g., `"1"`, `"question_A"`).
- **`type`**: The type of question. Currently supports `"mcq"` (Multiple Choice) and `"true_false"`.
- **`answer`**: The correct answer (Ground Truth). Must match one of the keys in `rois` (e.g., `"C"`, `"TRUE"`, `"FALSE"`).
- **`roi`**: (Region of Interest) The bounding box for the **entire question row**.
- **`rois`**: A dictionary where each key is a possible choice and the value is its detection zone.

---

### ROI Calculation for Frontend
The frontend should calculate sub-zones based on the layout of the choices.

#### 1. Horizontal Layout (Choices in a Row)
*Use this if choices are side-by-side (e.g., A | B | C | D).*
- **Sub-width**: `sw = width / N`
- **Choice ROI**: `[x + (index * sw), y, sw, h]`

#### 2. Vertical Layout (Choices in a Column)
*Use this if choices are stacked (Top to Bottom).*
- **Sub-height**: `sh = height / N`
- **Choice ROI**: `[x, y + (index * sh), w, sh]`

**Example (4 choices Vertical Order A-B-C-D):**
- **Choice A (Top)**: `[x, y, w, sh]`
- **Choice B**: `[x, y + sh, w, sh]`
- **Choice C**: `[x, y + 2*sh, w, sh]`
- **Choice D (Bottom)**: `[x, y + 3*sh, w, sh]`

> [!IMPORTANT]
> **Coordinate Alignment**: All calculations must be performed using the **natural dimensions** of the image. If the user draws on a scaled UI element (e.g., a 500px wide preview of a 2000px wide image), multiply all coordinates by the scale factor `(NaturalWidth / PreviewWidth)` before sending the JSON.

> [!TIP]
> **Hybrid Accuracy**: The AI is programmed to handle messy marks. If a mark is slightly outside a sub-box but still inside the parent question area, the AI will use its internal "Shape Recognition" to correctly identify the answer.

---

## 4. Understanding Coordinates `[x, y, w, h]`

All ROI values follow the format: `[x, y, width, height]`
- **`x`**: The horizontal distance (in pixels) from the left edge of the image to the top-left corner of the box.
- **`y`**: The vertical distance (in pixels) from the top edge of the image to the top-left corner of the box.
- **`width`**: The width of the bounding box in pixels.
- **`height`**: The height of the bounding box in pixels.

---

## 5. Response Format

### Success Case (HTTP 200 OK)
Returns a list of grading results, one for each file uploaded.

```json
{
  "results": [
    {
      "filename": "student_paper.jpg",
      "student_info": {
        "exam_id": "15",
        "student_id": "294",
        "page_number": "1",
        "raw_barcode": "15-294-1"
      },
      "details": {
        "score": 6,
        "total": 6,
        "details": [
          {
            "id": "1",
            "type": "mcq",
            "gt": "C",
            "pred": "C",
            "conf": 0.9,
            "ok": true,
            "method": "yolo-abcd"
          },
          {
            "id": "2",
            "type": "mcq",
            "gt": "C",
            "pred": "C",
            "conf": 0.913,
            "ok": true,
            "method": "yolo-abcd"
          },
          {
            "id": "3",
            "type": "mcq",
            "gt": "D",
            "pred": "D",
            "conf": 0.939,
            "ok": true,
            "method": "yolo-abcd"
          },
          {
            "id": "4",
            "type": "true_false",
            "gt": "TRUE",
            "pred": "TRUE",
            "conf": 0.979,
            "ok": true,
            "method": "yolo-true-false"
          },
          {
            "id": "5",
            "type": "true_false",
            "gt": "TRUE",
            "pred": "TRUE",
            "conf": 0.972,
            "ok": true,
            "method": "yolo-true-false"
          },
          {
            "id": "6",
            "type": "true_false",
            "gt": "TRUE",
            "pred": "TRUE",
            "conf": 0.967,
            "ok": true,
            "method": "yolo-true-false"
          }
        ],
        "annotated_image_path": "runs/annotated/temp_grade_xxx.png",
        "yolo_used": true
      },
      "annotated_image_url": "/runs/annotated/temp_grade_xxx.png"
    }
  ]
}
```

#### Response Fields:
- **`filename`**: Name of the uploaded file.
- **`student_info`**: Data extracted from the barcode (if present).
- **`details`**:
    - **`score`**: Number of correct answers.
    - **`total`**: Total number of questions processed.
    - **`details`**: List of results for each question.
        - **`pred`**: The answer detected by the AI (`"None"` if no answer was found).
        - **`conf`**: Confidence level of the detection.
        - **`ok`**: `true` if `pred` matches `gt`, else `false`.
        - **`method`**: The detection engine used (e.g., `yolo-abcd`, `yolo-true-false`).
    - **`annotated_image_url`**: URL to view the image with AI marks drawn on it.

---

## 6. Error Codes and Their Meanings
| Code | Meaning | Action |
| :--- | :--- | :--- |
| `200` | Success | Processing completed successfully. |
| `400` | Invalid JSON | Ensure the `model_config` string is properly escaped and valid JSON. |
| `422` | Validation Error | Ensure all required parameters are sent in the `multipart/form-data` body. |
| `500` | Internal Error | Check server logs. Common causes: Corrupted image or out-of-memory. |

---

## 7. Static File Access
The following paths serve files directly:
- **Student Uploads**: `/uploads/<filename>` (The processed/warped version of the student's paper).
- **Annotated Results**: `/runs/annotated/<filename>` (The paper with green/red boxes showing the AI's grading).

---

## 8. Additional Technical Notes
1. **Stateless Integration:** The AI service does **not** persist `model_config`. The database on the main website backend must store the ROIs/Answers and pass them in every request.
2. **Barcode Detection:** The system automatically attempts to read barcodes (CODE128, CODE39, EAN13) from the image. If found, it returns `student_info` including `exam_id`, `student_id`, and `page_number`.
3. **Multi-page Exams:** For exams with multiple sheets, use the `page_number` from `student_info` and the `student_id` to aggregate results for a single student in your database.
4. **PDF Processing:** PDF files are stitched into a single vertical image before grading. This may result in very tall images which require sufficient memory.
5. **Geometric Correction:** The service automatically applies warping/perspective correction to uploaded images to align them with the teacher's ROI coordinates.
6. **Authentication:** No built-in authentication. It is recommended to run this microservice in a private network (VPN) or behind a Reverse Proxy with API Keys.
7. **Static File Serving:** 
    - Warped student images: `/uploads/<filename>`.
    - Annotated results (with marks): `/runs/annotated/<filename>`.
