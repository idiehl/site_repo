using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Atlas.Web.Filters;

public class DevAuthFilter : IPageFilter
{
    public const string CookieName = "atlas_dev_auth";

    public void OnPageHandlerSelected(PageHandlerSelectedContext context) { }

    public void OnPageHandlerExecuting(PageHandlerExecutingContext context)
    {
        var cookie = context.HttpContext.Request.Cookies[CookieName];
        if (string.IsNullOrEmpty(cookie) || cookie != "authenticated")
        {
            context.Result = new RedirectToPageResult("/Dev/Login");
        }
    }

    public void OnPageHandlerExecuted(PageHandlerExecutedContext context) { }
}
