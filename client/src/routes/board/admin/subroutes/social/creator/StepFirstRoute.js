import UndrawCreateProject from "assets/svg/undraw/create_project.svg";
import SetupCard, {SetupCardIcon} from "components/board/admin/SetupCard";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React from 'react';
import {FaFileUpload} from "react-icons/all";
import {FaDiscord, FaGithub, FaGlobe, FaPatreon, FaYoutube} from "react-icons/fa";
import {UiCol, UiRow} from "ui/grid";
import {getBase64FromFile, validateImageWithWarning} from "utils/basic-utils";

const itemsIcons = [<SetupCardIcon as={FaGithub}/>, <SetupCardIcon as={FaDiscord}/>, <SetupCardIcon as={FaPatreon}/>, <SetupCardIcon as={FaYoutube}/>,
    <SetupCardIcon as={FaGlobe}/>, <SetupCardIcon as={FaFileUpload}/>];
const itemNames = ["GitHub", "Discord", "Patreon", "YouTube", "Website", "Custom"];
const itemData = ["data:image/png;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhYiIgZGF0YS1pY29uPSJnaXRodWIiIGNsYXNzPSJzdmctaW5saW5lLS1mYSBmYS1naXRodWIgZmEtdy0xNiIgcm9sZT0iaW1nIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OTYgNTEyIj48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xNjUuOSAzOTcuNGMwIDItMi4zIDMuNi01LjIgMy42LTMuMy4zLTUuNi0xLjMtNS42LTMuNiAwLTIgMi4zLTMuNiA1LjItMy42IDMtLjMgNS42IDEuMyA1LjYgMy42em0tMzEuMS00LjVjLS43IDIgMS4zIDQuMyA0LjMgNC45IDIuNiAxIDUuNiAwIDYuMi0ycy0xLjMtNC4zLTQuMy01LjJjLTIuNi0uNy01LjUuMy02LjIgMi4zem00NC4yLTEuN2MtMi45LjctNC45IDIuNi00LjYgNC45LjMgMiAyLjkgMy4zIDUuOSAyLjYgMi45LS43IDQuOS0yLjYgNC42LTQuNi0uMy0xLjktMy0zLjItNS45LTIuOXpNMjQ0LjggOEMxMDYuMSA4IDAgMTEzLjMgMCAyNTJjMCAxMTAuOSA2OS44IDIwNS44IDE2OS41IDIzOS4yIDEyLjggMi4zIDE3LjMtNS42IDE3LjMtMTIuMSAwLTYuMi0uMy00MC40LS4zLTYxLjQgMCAwLTcwIDE1LTg0LjctMjkuOCAwIDAtMTEuNC0yOS4xLTI3LjgtMzYuNiAwIDAtMjIuOS0xNS43IDEuNi0xNS40IDAgMCAyNC45IDIgMzguNiAyNS44IDIxLjkgMzguNiA1OC42IDI3LjUgNzIuOSAyMC45IDIuMy0xNiA4LjgtMjcuMSAxNi0zMy43LTU1LjktNi4yLTExMi4zLTE0LjMtMTEyLjMtMTEwLjUgMC0yNy41IDcuNi00MS4zIDIzLjYtNTguOS0yLjYtNi41LTExLjEtMzMuMyAyLjYtNjcuOSAyMC45LTYuNSA2OSAyNyA2OSAyNyAyMC01LjYgNDEuNS04LjUgNjIuOC04LjVzNDIuOCAyLjkgNjIuOCA4LjVjMCAwIDQ4LjEtMzMuNiA2OS0yNyAxMy43IDM0LjcgNS4yIDYxLjQgMi42IDY3LjkgMTYgMTcuNyAyNS44IDMxLjUgMjUuOCA1OC45IDAgOTYuNS01OC45IDEwNC4yLTExNC44IDExMC41IDkuMiA3LjkgMTcgMjIuOSAxNyA0Ni40IDAgMzMuNy0uMyA3NS40LS4zIDgzLjYgMCA2LjUgNC42IDE0LjQgMTcuMyAxMi4xQzQyOC4yIDQ1Ny44IDQ5NiAzNjIuOSA0OTYgMjUyIDQ5NiAxMTMuMyAzODMuNSA4IDI0NC44IDh6TTk3LjIgMzUyLjljLTEuMyAxLTEgMy4zLjcgNS4yIDEuNiAxLjYgMy45IDIuMyA1LjIgMSAxLjMtMSAxLTMuMy0uNy01LjItMS42LTEuNi0zLjktMi4zLTUuMi0xem0tMTAuOC04LjFjLS43IDEuMy4zIDIuOSAyLjMgMy45IDEuNiAxIDMuNi43IDQuMy0uNy43LTEuMy0uMy0yLjktMi4zLTMuOS0yLS42LTMuNi0uMy00LjMuN3ptMzIuNCAzNS42Yy0xLjYgMS4zLTEgNC4zIDEuMyA2LjIgMi4zIDIuMyA1LjIgMi42IDYuNSAxIDEuMy0xLjMuNy00LjMtMS4zLTYuMi0yLjItMi4zLTUuMi0yLjYtNi41LTF6bS0xMS40LTE0LjdjLTEuNiAxLTEuNiAzLjYgMCA1LjkgMS42IDIuMyA0LjMgMy4zIDUuNiAyLjMgMS42LTEuMyAxLjYtMy45IDAtNi4yLTEuNC0yLjMtNC0zLjMtNS42LTJ6Ij48L3BhdGg+PC9zdmc+",
    "data:image/png;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhYiIgZGF0YS1pY29uPSJkaXNjb3JkIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtZGlzY29yZCBmYS13LTE0IiByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQ0OCA1MTIiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTI5Ny4yMTYgMjQzLjJjMCAxNS42MTYtMTEuNTIgMjguNDE2LTI2LjExMiAyOC40MTYtMTQuMzM2IDAtMjYuMTEyLTEyLjgtMjYuMTEyLTI4LjQxNnMxMS41Mi0yOC40MTYgMjYuMTEyLTI4LjQxNmMxNC41OTIgMCAyNi4xMTIgMTIuOCAyNi4xMTIgMjguNDE2em0tMTE5LjU1Mi0yOC40MTZjLTE0LjU5MiAwLTI2LjExMiAxMi44LTI2LjExMiAyOC40MTZzMTEuNzc2IDI4LjQxNiAyNi4xMTIgMjguNDE2YzE0LjU5MiAwIDI2LjExMi0xMi44IDI2LjExMi0yOC40MTYuMjU2LTE1LjYxNi0xMS41Mi0yOC40MTYtMjYuMTEyLTI4LjQxNnpNNDQ4IDUyLjczNlY1MTJjLTY0LjQ5NC01Ni45OTQtNDMuODY4LTM4LjEyOC0xMTguNzg0LTEwNy43NzZsMTMuNTY4IDQ3LjM2SDUyLjQ4QzIzLjU1MiA0NTEuNTg0IDAgNDI4LjAzMiAwIDM5OC44NDhWNTIuNzM2QzAgMjMuNTUyIDIzLjU1MiAwIDUyLjQ4IDBoMzQzLjA0QzQyNC40NDggMCA0NDggMjMuNTUyIDQ0OCA1Mi43MzZ6bS03Mi45NiAyNDIuNjg4YzAtODIuNDMyLTM2Ljg2NC0xNDkuMjQ4LTM2Ljg2NC0xNDkuMjQ4LTM2Ljg2NC0yNy42NDgtNzEuOTM2LTI2Ljg4LTcxLjkzNi0yNi44OGwtMy41ODQgNC4wOTZjNDMuNTIgMTMuMzEyIDYzLjc0NCAzMi41MTIgNjMuNzQ0IDMyLjUxMi02MC44MTEtMzMuMzI5LTEzMi4yNDQtMzMuMzM1LTE5MS4yMzItNy40MjQtOS40NzIgNC4zNTItMTUuMTA0IDcuNDI0LTE1LjEwNCA3LjQyNHMyMS4yNDgtMjAuMjI0IDY3LjMyOC0zMy41MzZsLTIuNTYtMy4wNzJzLTM1LjA3Mi0uNzY4LTcxLjkzNiAyNi44OGMwIDAtMzYuODY0IDY2LjgxNi0zNi44NjQgMTQ5LjI0OCAwIDAgMjEuNTA0IDM3LjEyIDc4LjA4IDM4LjkxMiAwIDAgOS40NzItMTEuNTIgMTcuMTUyLTIxLjI0OC0zMi41MTItOS43MjgtNDQuOC0zMC4yMDgtNDQuOC0zMC4yMDggMy43NjYgMi42MzYgOS45NzYgNi4wNTMgMTAuNDk2IDYuNCA0My4yMSAyNC4xOTggMTA0LjU4OCAzMi4xMjYgMTU5Ljc0NCA4Ljk2IDguOTYtMy4zMjggMTguOTQ0LTguMTkyIDI5LjQ0LTE1LjEwNCAwIDAtMTIuOCAyMC45OTItNDYuMzM2IDMwLjQ2NCA3LjY4IDkuNzI4IDE2Ljg5NiAyMC43MzYgMTYuODk2IDIwLjczNiA1Ni41NzYtMS43OTIgNzguMzM2LTM4LjkxMiA3OC4zMzYtMzguOTEyeiI+PC9wYXRoPjwvc3ZnPg==",
    "data:image/png;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhYiIgZGF0YS1pY29uPSJwYXRyZW9uIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtcGF0cmVvbiBmYS13LTE2IiByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTUxMiAxOTQuOGMwIDEwMS4zLTgyLjQgMTgzLjgtMTgzLjggMTgzLjgtMTAxLjcgMC0xODQuNC04Mi40LTE4NC40LTE4My44IDAtMTAxLjYgODIuNy0xODQuMyAxODQuNC0xODQuM0M0MjkuNiAxMC41IDUxMiA5My4yIDUxMiAxOTQuOHpNMCA1MDEuNWg5MHYtNDkxSDB2NDkxeiI+PC9wYXRoPjwvc3ZnPg==",
    "data:image/png;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhYiIgZGF0YS1pY29uPSJ5b3V0dWJlIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEteW91dHViZSBmYS13LTE4IiByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDU3NiA1MTIiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTU0OS42NTUgMTI0LjA4M2MtNi4yODEtMjMuNjUtMjQuNzg3LTQyLjI3Ni00OC4yODQtNDguNTk3QzQ1OC43ODEgNjQgMjg4IDY0IDI4OCA2NFMxMTcuMjIgNjQgNzQuNjI5IDc1LjQ4NmMtMjMuNDk3IDYuMzIyLTQyLjAwMyAyNC45NDctNDguMjg0IDQ4LjU5Ny0xMS40MTIgNDIuODY3LTExLjQxMiAxMzIuMzA1LTExLjQxMiAxMzIuMzA1czAgODkuNDM4IDExLjQxMiAxMzIuMzA1YzYuMjgxIDIzLjY1IDI0Ljc4NyA0MS41IDQ4LjI4NCA0Ny44MjFDMTE3LjIyIDQ0OCAyODggNDQ4IDI4OCA0NDhzMTcwLjc4IDAgMjEzLjM3MS0xMS40ODZjMjMuNDk3LTYuMzIxIDQyLjAwMy0yNC4xNzEgNDguMjg0LTQ3LjgyMSAxMS40MTItNDIuODY3IDExLjQxMi0xMzIuMzA1IDExLjQxMi0xMzIuMzA1czAtODkuNDM4LTExLjQxMi0xMzIuMzA1em0tMzE3LjUxIDIxMy41MDhWMTc1LjE4NWwxNDIuNzM5IDgxLjIwNS0xNDIuNzM5IDgxLjIwMXoiPjwvcGF0aD48L3N2Zz4=",
    "data:image/png;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJnbG9iZSIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLWdsb2JlIGZhLXctMTYiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDk2IDUxMiI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMzM2LjUgMTYwQzMyMiA3MC43IDI4Ny44IDggMjQ4IDhzLTc0IDYyLjctODguNSAxNTJoMTc3ek0xNTIgMjU2YzAgMjIuMiAxLjIgNDMuNSAzLjMgNjRoMTg1LjNjMi4xLTIwLjUgMy4zLTQxLjggMy4zLTY0cy0xLjItNDMuNS0zLjMtNjRIMTU1LjNjLTIuMSAyMC41LTMuMyA0MS44LTMuMyA2NHptMzI0LjctOTZjLTI4LjYtNjcuOS04Ni41LTEyMC40LTE1OC0xNDEuNiAyNC40IDMzLjggNDEuMiA4NC43IDUwIDE0MS42aDEwOHpNMTc3LjIgMTguNEMxMDUuOCAzOS42IDQ3LjggOTIuMSAxOS4zIDE2MGgxMDhjOC43LTU2LjkgMjUuNS0xMDcuOCA0OS45LTE0MS42ek00ODcuNCAxOTJIMzcyLjdjMi4xIDIxIDMuMyA0Mi41IDMuMyA2NHMtMS4yIDQzLTMuMyA2NGgxMTQuNmM1LjUtMjAuNSA4LjYtNDEuOCA4LjYtNjRzLTMuMS00My41LTguNS02NHpNMTIwIDI1NmMwLTIxLjUgMS4yLTQzIDMuMy02NEg4LjZDMy4yIDIxMi41IDAgMjMzLjggMCAyNTZzMy4yIDQzLjUgOC42IDY0aDExNC42Yy0yLTIxLTMuMi00Mi41LTMuMi02NHptMzkuNSA5NmMxNC41IDg5LjMgNDguNyAxNTIgODguNSAxNTJzNzQtNjIuNyA4OC41LTE1MmgtMTc3em0xNTkuMyAxNDEuNmM3MS40LTIxLjIgMTI5LjQtNzMuNyAxNTgtMTQxLjZoLTEwOGMtOC44IDU2LjktMjUuNiAxMDcuOC01MCAxNDEuNnpNMTkuMyAzNTJjMjguNiA2Ny45IDg2LjUgMTIwLjQgMTU4IDE0MS42LTI0LjQtMzMuOC00MS4yLTg0LjctNTAtMTQxLjZoLTEwOHoiPjwvcGF0aD48L3N2Zz4=",
];

const StepFirstRoute = ({settings, updateSettings}) => {
    const renderCards = () => {
        return itemsIcons.map((item, i) => {
            let name = itemNames[i];
            if (name === "Custom") {
                return <SetupCard key={i} icon={settings.iconData === "" || !settings.customIcon ? item : <SetupCardIcon as={"img"} alt={"Icon"} src={settings.iconData}/>}
                                  text={name} className={"m-2"} onClick={onCustomUpload} chosen={settings.chosen === i}/>
            }
            return <SetupCard key={i} icon={item} text={name} onClick={() => setChosen(i)} className={"m-2"} chosen={settings.chosen === i}/>
        });
    };
    const onCustomUpload = () => {
        document.getElementById("logoInput").click();
    };
    const onUpload = (e) => {
        if (!validateImageWithWarning(e, "logoInput", 150)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            updateSettings({
                ...settings, chosen: 5, customIcon: true, iconData: data
            });
        });
    };
    const setChosen = (item) => {
        updateSettings({
            ...settings, chosen: item, customIcon: false, iconData: itemData[item]
        });
    };

    return <React.Fragment>
        <input id={"logoInput"} type={"file"} accept={"image/jpeg, image/png"} className={"d-none"} name={"logo"} onChange={e => onUpload(e)}/>
        <SetupImageBanner svg={UndrawCreateProject} stepName={"Choose Link Icon"} stepDescription={"Select icon that your Social Link will represent."}/>
        <UiCol xs={12} className={"mt-3"}>
            <UiCol centered as={UiRow} className={"mx-0"} xs={12}>
                {renderCards()}
            </UiCol>
        </UiCol>
    </React.Fragment>
};
export default StepFirstRoute;