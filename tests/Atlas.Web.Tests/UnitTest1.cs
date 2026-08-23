using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Atlas.Web.Tests;

public sealed class AtlasRoutesTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AtlasRoutesTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    [Fact]
    public async Task HomePage_ShouldRenderMinimalLanding()
    {
        var response = await _client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var html = await response.Content.ReadAsStringAsync();
        html.Should().Contain("Atlas Universalis");
        html.Should().Contain("Custom Software Strategy & Delivery");
        html.Should().Contain("Many challenges. One solution mindset.");
    }

    [Fact]
    public async Task Healthz_ShouldReturnHealthyPayload()
    {
        var payload = await _client.GetFromJsonAsync<HealthPayload>("/healthz");

        payload.Should().NotBeNull();
        payload!.Status.Should().Be("healthy");
        payload.App.Should().Be("atlas-web");
        payload.Release.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task CtaRoutes_ShouldBeReachable()
    {
        var createAccount = await _client.GetAsync("/Account/Create");
        createAccount.StatusCode.Should().Be(HttpStatusCode.OK);

        var explore = await _client.GetAsync("/Explore");
        explore.StatusCode.Should().Be(HttpStatusCode.OK);

        var launchScope = await _client.GetAsync("/launch-scope");
        launchScope.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task LaunchScope_ShouldRenderPlanner()
    {
        var response = await _client.GetAsync("/launch-scope");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var html = await response.Content.ReadAsStringAsync();
        html.Should().Contain("Launch Scope Builder");
        html.Should().Contain("Tomorrow MVP scope");
        html.Should().Contain("Success criteria");
    }

    [Fact]
    public async Task ArchiveIndex_ShouldListPublicPortablePages()
    {
        var response = await _client.GetAsync("/Archive");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var html = await response.Content.ReadAsStringAsync();
        html.Should().Contain("Welcome to the Archive");
        html.Should().Contain("/Archive/atlas-welcome");
    }

    [Fact]
    public async Task ArchiveEntry_ShouldHostRazorComponentInsideAtlasShell()
    {
        var response = await _client.GetAsync("/Archive/atlas-welcome");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var html = await response.Content.ReadAsStringAsync();
        html.Should().Contain("A portable page has entered the Archive.");
        html.Should().Contain("Atlas Universalis");
    }

    [Theory]
    [InlineData("/Archive/not-published")]
    [InlineData("/Archive/%2e%2e%2fsecrets")]
    public async Task ArchiveEntry_ShouldRejectUnknownOrUnsafeSlugs(string route)
    {
        var response = await _client.GetAsync(route);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private sealed record HealthPayload(string Status, string App, string Release);
}
