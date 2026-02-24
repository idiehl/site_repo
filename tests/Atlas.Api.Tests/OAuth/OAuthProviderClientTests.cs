using Atlas.Api.OAuth;
using Atlas.Contracts.Configuration;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Atlas.Api.Tests.OAuth;

public sealed class OAuthProviderClientTests
{
    [Theory]
    [InlineData("google")]
    [InlineData("linkedin")]
    public async Task ExchangeCodeForUserAsync_WithInvalidTokenJson_ShouldReturnNull(string provider)
    {
        using var httpClient = new HttpClient(new SequenceHttpMessageHandler(
        [
            new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("not-json"),
            },
        ]));
        var settings = Options.Create(CreateSettings());
        var client = new OAuthProviderClient(httpClient, settings);

        var result = await client.ExchangeCodeForUserAsync(provider, "test-code");

        result.Should().BeNull();
    }

    [Theory]
    [InlineData("google")]
    [InlineData("linkedin")]
    public async Task ExchangeCodeForUserAsync_WithInvalidUserInfoJson_ShouldReturnNull(string provider)
    {
        using var httpClient = new HttpClient(new SequenceHttpMessageHandler(
        [
            new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("{\"access_token\":\"token\"}", System.Text.Encoding.UTF8, "application/json"),
            },
            new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("{"),
            },
        ]));
        var settings = Options.Create(CreateSettings());
        var client = new OAuthProviderClient(httpClient, settings);

        var result = await client.ExchangeCodeForUserAsync(provider, "test-code");

        result.Should().BeNull();
    }

    private static OAuthSettings CreateSettings()
    {
        return new OAuthSettings
        {
            GoogleClientId = "google-client-id",
            GoogleClientSecret = "google-client-secret",
            GoogleRedirectUri = "http://localhost:5010/api/v2/auth/google/callback",
            LinkedInClientId = "linkedin-client-id",
            LinkedInClientSecret = "linkedin-client-secret",
            LinkedInRedirectUri = "http://localhost:5010/api/v2/auth/linkedin/callback",
        };
    }

    private sealed class SequenceHttpMessageHandler : HttpMessageHandler
    {
        private readonly Queue<HttpResponseMessage> _responses;

        public SequenceHttpMessageHandler(IEnumerable<HttpResponseMessage> responses)
        {
            _responses = new Queue<HttpResponseMessage>(responses);
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (_responses.Count == 0)
            {
                throw new InvalidOperationException($"No response configured for request: {request.Method} {request.RequestUri}");
            }

            return Task.FromResult(_responses.Dequeue());
        }
    }
}
