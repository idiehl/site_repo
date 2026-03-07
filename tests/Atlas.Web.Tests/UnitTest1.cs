using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Atlas.Web.Tests;

public sealed class PlaceholderRoutesTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PlaceholderRoutesTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    [Fact]
    public async Task HomePage_ShouldRenderLandingArchitecture()
    {
        var response = await _client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var html = await response.Content.ReadAsStringAsync();
        html.Should().Contain("Navigate the Digital Frontier With Confidence");
        html.Should().Contain("Create Account");
    }

    [Fact]
    public async Task Healthz_ShouldReturnHealthyPayload()
    {
        var payload = await _client.GetFromJsonAsync<HealthPayload>("/healthz");

        payload.Should().NotBeNull();
        payload!.Status.Should().Be("healthy");
        payload.App.Should().Be("atlas-web-placeholder");
    }

    [Fact]
    public async Task CtaRoutes_ShouldBeReachable()
    {
        var createAccount = await _client.GetAsync("/Account/Create");
        createAccount.StatusCode.Should().Be(HttpStatusCode.OK);

        var explore = await _client.GetAsync("/Explore");
        explore.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private sealed record HealthPayload(string Status, string App);
}
