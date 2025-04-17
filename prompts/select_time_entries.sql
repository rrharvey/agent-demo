select 
    TimeEntries.Id,
    Clients.Name as ClientName,
    Projects.Name as ProjectName,
    Date,
    Hours
from TimeEntries join Projects on TimeEntries.ProjectId = Projects.Id
join Clients on Projects.ClientId = Clients.Id
