from flask import Flask, render_template, request, redirect, url_for, session
from ultralytics import YOLO
from werkzeug.utils import secure_filename
import sqlite3
import os
import cv2
from datetime import datetime
from flask import Flask, Response, url_for

app = Flask(__name__)

@app.route('/sitemap.xml', methods=['GET'])
def sitemap():
    pages = []
    # Add static routes
    pages.append(url_for('index', _external=True))
    pages.append(url_for('about', _external=True))
    pages.append(url_for('contact', _external=True))

    # Build XML
    sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>'
    sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    for page in pages:
        sitemap_xml += f'<url><loc>{page}</loc></url>'
    sitemap_xml += '</urlset>'

    return Response(sitemap_xml, mimetype='application/xml')



# =========================================================
# SMART ROADS - FLASK APPLICATION
# =========================================================

app = Flask(
    __name__,
    static_folder="templates/static"
)

app.secret_key = "smart_roads_secret_key"


# =========================================================
# ADMIN LOGIN DETAILS
# =========================================================

ADMIN_ID = "admin"
ADMIN_PASSWORD = "12345"


# =========================================================
# DATABASE
# =========================================================

DATABASE = "smart_roads.db"


def init_database():

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            location TEXT,
            issue_type TEXT,
            description TEXT,
            date_time TEXT,
            status TEXT
        )
    """)

    connection.commit()
    connection.close()


# =========================================================
# UPLOAD FOLDER
# =========================================================

UPLOAD_FOLDER = "templates/static/uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# AI MODELS
# =========================================================

traffic_model = YOLO("yolo11n.pt")

ambulance_model = YOLO("yolov8n-oiv7.pt")


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.route(
    "/authority-login",
    methods=["GET", "POST"]
)
@app.route(
    "/admin-login",
    methods=["GET", "POST"]
)
def admin_login():

    if request.method == "POST":

        admin_id = request.form.get(
            "admin_id"
        )

        if not admin_id:

            admin_id = request.form.get(
                "authority_id"
            )

        password = request.form.get(
            "password"
        )

        if (
            admin_id == ADMIN_ID
            and password == ADMIN_PASSWORD
        ):

            session["admin_logged_in"] = True

            return redirect(
                url_for(
                    "admin_dashboard"
                )
            )

        return render_template(
            "authority_login.html",
            error="Invalid Admin ID or Password"
        )

    return render_template(
        "authority_login.html"
    )


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/authority-dashboard")
@app.route("/admin-dashboard")
def admin_dashboard():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    return render_template(
        "authority_dashboard.html"
    )


# =========================================================
# AMBULANCE DETECTION
# =========================================================

@app.route(
    "/ambulance-detection",
    methods=["GET", "POST"]
)
def ambulance_detection():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    if request.method == "POST":

        file = request.files.get(
            "ambulance_image"
        )

        if (
            not file
            or file.filename == ""
        ):

            return render_template(
                "ambulance_detection.html",
                error="Please select an image first."
            )

        try:

            filename = secure_filename(
                file.filename
            )

            image_path = os.path.join(
                UPLOAD_FOLDER,
                filename
            )

            file.save(
                image_path
            )

            print()
            print("================================")
            print("SMART ROADS")
            print("AMBULANCE AI ANALYSIS")
            print("================================")

            results = ambulance_model(
                image_path,
                conf=0.15
            )

            ambulance_detected = False

            confidence = 0.0

            detected_objects = []

            result_filename = (
                "ambulance_result_"
                + filename
            )

            result_path = os.path.join(
                UPLOAD_FOLDER,
                result_filename
            )

            for result in results:

                if result.boxes is not None:

                    for box in result.boxes:

                        class_id = int(
                            box.cls[0]
                        )

                        conf = float(
                            box.conf[0]
                        )

                        class_name = str(
                            ambulance_model.names[
                                class_id
                            ]
                        )

                        detected_objects.append(
                            {
                                "name": class_name,
                                "confidence": round(
                                    conf * 100,
                                    1
                                )
                            }
                        )

                        print(
                            "Detected:",
                            class_name,
                            "| Confidence:",
                            round(
                                conf * 100,
                                1
                            ),
                            "%"
                        )

                        if (
                            class_name
                            .lower()
                            .strip()
                            == "ambulance"
                        ):

                            ambulance_detected = True

                            confidence = max(
                                confidence,
                                conf * 100
                            )

                annotated_image = result.plot()

                cv2.imwrite(
                    result_path,
                    annotated_image
                )

            print(
                "Ambulance detected:",
                ambulance_detected
            )

            print(
                "================================"
            )

            result_data = {

                "detected":
                    ambulance_detected,

                "confidence":
                    round(
                        confidence,
                        1
                    ),

                "objects":
                    detected_objects
            }

            image_url = (
                "/static/uploads/"
                + result_filename
            )

            return render_template(
                "ambulance_detection.html",
                result=result_data,
                image_url=image_url
            )

        except Exception as e:

            print(
                "AMBULANCE DETECTION ERROR:",
                str(e)
            )

            return render_template(
                "ambulance_detection.html",
                error=(
                    "AI detection failed: "
                    + str(e)
                )
            )

    return render_template(
        "ambulance_detection.html"
    )


# =========================================================
# SMART SIGNAL
# =========================================================

@app.route("/smart-signal")
def smart_signal():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    return render_template(
        "smart_signal.html"
    )


# =========================================================
# TRAFFIC ANALYSIS
# =========================================================

@app.route(
    "/traffic-analysis",
    methods=["GET", "POST"]
)
def traffic_analysis():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    if request.method == "POST":

        file = request.files.get(
            "traffic_image"
        )

        if (
            not file
            or file.filename == ""
        ):

            return render_template(
                "traffic_analysis.html",
                error="Please upload a traffic image."
            )

        try:

            filename = secure_filename(
                file.filename
            )

            image_path = os.path.join(
                UPLOAD_FOLDER,
                filename
            )

            file.save(
                image_path
            )

            results = traffic_model(
                image_path,
                conf=0.25
            )

            total = 0
            cars = 0
            motorcycles = 0
            buses = 0
            trucks = 0

            for result in results:

                if result.boxes is None:
                    continue

                for box in result.boxes:

                    class_id = int(
                        box.cls[0]
                    )

                    class_name = str(
                        traffic_model.names[
                            class_id
                        ]
                    ).lower()

                    if class_name == "car":

                        cars += 1
                        total += 1

                    elif class_name in [
                        "motorcycle",
                        "motorbike"
                    ]:

                        motorcycles += 1
                        total += 1

                    elif class_name == "bus":

                        buses += 1
                        total += 1

                    elif class_name == "truck":

                        trucks += 1
                        total += 1

            if total >= 15:

                traffic_level = "High"

                congestion = (
                    "Heavy Congestion"
                )

                recommendation = (
                    "Heavy traffic detected. "
                    "Extended green signal timing "
                    "is recommended."
                )

            elif total >= 8:

                traffic_level = "Medium"

                congestion = (
                    "Moderate Congestion"
                )

                recommendation = (
                    "Moderate traffic detected. "
                    "Balanced signal timing "
                    "is recommended."
                )

            else:

                traffic_level = "Low"

                congestion = (
                    "Low Congestion"
                )

                recommendation = (
                    "Traffic flow is normal. "
                    "Normal signal timing "
                    "can be maintained."
                )

            result_filename = (
                "traffic_result_"
                + filename
            )

            result_path = os.path.join(
                UPLOAD_FOLDER,
                result_filename
            )

            for result in results:

                annotated_image = result.plot()

                cv2.imwrite(
                    result_path,
                    annotated_image
                )

                break

            result_data = {

                "total":
                    total,

                "traffic_level":
                    traffic_level,

                "congestion":
                    congestion,

                "vehicles": {

                    "car":
                        cars,

                    "motorcycle":
                        motorcycles,

                    "bus":
                        buses,

                    "truck":
                        trucks
                },

                "recommendation":
                    recommendation
            }

            image_url = (
                "/static/uploads/"
                + result_filename
            )

            return render_template(
                "traffic_analysis.html",
                result=result_data,
                image_url=image_url
            )

        except Exception as e:

            print(
                "TRAFFIC ANALYSIS ERROR:",
                str(e)
            )

            return render_template(
                "traffic_analysis.html",
                error=(
                    "Traffic analysis failed: "
                    + str(e)
                )
            )

    return render_template(
        "traffic_analysis.html"
    )


# =========================================================
# PUBLIC PORTAL
# =========================================================

@app.route("/public-portal")
def public_portal():

    return render_template(
        "public_portal.html"
    )


# =========================================================
# PUBLIC EMERGENCY
# =========================================================

@app.route(
    "/public-emergency",
    methods=["GET", "POST"]
)
def public_emergency():

    if request.method == "POST":

        name = request.form.get(
            "name"
        )

        vehicle_number = request.form.get(
            "vehicle_number"
        )

        emergency_type = request.form.get(
            "emergency_type"
        )

        location = request.form.get(
            "location"
        )

        description = request.form.get(
            "description"
        )

        print()
        print(
            "========== EMERGENCY REQUEST =========="
        )

        print(
            "Name:",
            name
        )

        print(
            "Vehicle Number:",
            vehicle_number
        )

        print(
            "Emergency Type:",
            emergency_type
        )

        print(
            "Location:",
            location
        )

        print(
            "Description:",
            description
        )

        print(
            "======================================="
        )

        return render_template(
            "public_emergency.html",
            success=(
                "Emergency request "
                "submitted successfully."
            )
        )

    return render_template(
        "public_emergency.html"
    )


# =========================================================
# PUBLIC CHALLAN
# =========================================================

@app.route(
    "/challan",
    methods=["GET", "POST"]
)
def challan():

    if request.method == "POST":

        vehicle_number = (
            request.form.get(
                "vehicle_number",
                ""
            )
            .strip()
            .upper()
        )

        demo_challans = {

            "TN01AB1234": {

                "vehicle_number":
                    "TN01AB1234",

                "violation":
                    "Signal Jumping",

                "date":
                    "16-Aug-2026",

                "location":
                    "Main Junction",

                "fine":
                    "1000",

                "status":
                    "Unpaid"
            },

            "TN02CD5678": {

                "vehicle_number":
                    "TN02CD5678",

                "violation":
                    "Overspeeding",

                "date":
                    "15-Aug-2026",

                "location":
                    "City Road",

                "fine":
                    "750",

                "status":
                    "Unpaid"
            }
        }

        challan_data = (
            demo_challans.get(
                vehicle_number
            )
        )

        if challan_data:

            return render_template(
                "challan.html",
                challan=challan_data
            )

        return render_template(
            "challan.html",
            error=(
                "No violation record "
                "found for this vehicle number."
            )
        )

    return render_template(
        "challan.html"
    )


# =========================================================
# PUBLIC REPORT ISSUE
# =========================================================

@app.route(
    "/report-issue",
    methods=["GET", "POST"]
)
def report_issue():

    submitted = False

    if request.method == "POST":

        name = request.form.get(
            "name",
            "Anonymous"
        ).strip()

        location = request.form.get(
            "location",
            ""
        ).strip()

        issue_type = request.form.get(
            "issue_type",
            ""
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        date_time = datetime.now().strftime(
            "%d-%m-%Y %I:%M %p"
        )

        connection = sqlite3.connect(
            DATABASE
        )

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO reports
            (
                name,
                location,
                issue_type,
                description,
                date_time,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                name,
                location,
                issue_type,
                description,
                date_time,
                "Pending"
            )
        )

        connection.commit()

        connection.close()

        submitted = True

    return render_template(
        "report_issue.html",
        submitted=submitted
    )


# =========================================================
# ADMIN REPORT DATABASE
# =========================================================

@app.route("/reports")
def reports():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    connection = sqlite3.connect(
        DATABASE
    )

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    # Get all reports
    cursor.execute(
        """
        SELECT *
        FROM reports
        ORDER BY id DESC
        """
    )

    reports_data = cursor.fetchall()

    # Total reports
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM reports
        """
    )

    total_reports = cursor.fetchone()[0]

    # Pending reports
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM reports
        WHERE status = 'Pending'
        """
    )

    pending_reports = cursor.fetchone()[0]

    # Resolved reports
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM reports
        WHERE status = 'Resolved'
        """
    )

    resolved_reports = cursor.fetchone()[0]

    connection.close()

    return render_template(
        "reports.html",
        reports=reports_data,
        total_reports=total_reports,
        pending_reports=pending_reports,
        resolved_reports=resolved_reports
    )


# =========================================================
# RESOLVE REPORT
# =========================================================

@app.route(
    "/update-report-status/<int:report_id>",
    methods=["POST"]
)
def update_report_status(
    report_id
):

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    connection = sqlite3.connect(
        DATABASE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE reports
        SET status = 'Resolved'
        WHERE id = ?
        """,
        (
            report_id,
        )
    )

    connection.commit()

    connection.close()

    return redirect(
        url_for(
            "reports"
        )
    )


# =========================================================
# DELETE REPORT
# =========================================================

@app.route(
    "/delete-report/<int:report_id>",
    methods=["POST"]
)
def delete_report(
    report_id
):

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    connection = sqlite3.connect(
        DATABASE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM reports
        WHERE id = ?
        """,
        (
            report_id,
        )
    )

    connection.commit()

    connection.close()

    return redirect(
        url_for(
            "reports"
        )
    )


# =========================================================
# TRAFFIC STATUS
# =========================================================

@app.route("/traffic-status")
def traffic_status():

    return render_template(
        "traffic_status.html"
    )


# =========================================================
# TRAFFIC ALERTS
# =========================================================

@app.route("/traffic-alerts")
def traffic_alerts():

    return render_template(
        "traffic_alerts.html"
    )


# =========================================================
# LIVE TRAFFIC
# =========================================================

@app.route("/live-traffic")
def live_traffic():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    return render_template(
        "live_traffic.html"
    )


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.pop(
        "admin_logged_in",
        None
    )

    return redirect(
        url_for("home")
    )


# =========================================================
# START APPLICATION
# =========================================================

if __name__ == "__main__":

    init_database()

    app.run(
    host="0.0.0.0",
    port=5000,
    debug=True,
    ssl_context="adhoc"
)
