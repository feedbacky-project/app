import swalReact from "sweetalert2-react-content";
import Swal from "sweetalert2";

const swalGenerator = swalReact(Swal);

export const popupSwal = (icon, title, html, confirmButtonText, confirmButtonColor, thenApply = () => {
}) => {
    swalGenerator.fire({
        title,
        html,
        icon,
        showCancelButton: true,
        animation: false,
        reverseButtons: true,
        focusCancel: true,
        confirmButtonColor,
        confirmButtonText,
    }).then(fulfill => {
        thenApply(fulfill);
    });
};